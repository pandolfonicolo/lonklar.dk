#!/usr/bin/env bash
set -euo pipefail

# Called under /tmp/lonklar-deploy.lock by the SSH workflow. The existing
# feedback volume is reused; no data migration is part of this release.
revision=${1:?Pass the full verified Git SHA}
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid revision' >&2; exit 1; }
[[ "$(git rev-parse HEAD)" == "$revision" ]] || { echo 'Checkout does not match verified revision' >&2; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { echo 'Checkout contains unpublished changes' >&2; exit 1; }
[[ -n "${ADMIN_TOKEN:-}" && "$ADMIN_TOKEN" != *$'\n'* && "$ADMIN_TOKEN" != *$'\r'* ]] || {
  echo 'ADMIN_TOKEN must be set and contain one line' >&2; exit 1;
}

image="lonklar:$revision"
updated_at=$(git log -1 --format=%cI)
sudo docker build --build-arg "APP_UPDATED_AT=$updated_at" \
  --label "org.opencontainers.image.revision=$revision" -t "$image" .

# Values arrive as environment data, never as interpolated shell source.
# Create an empty private file first, then write without exposing it in logs.
sudo install -m 600 /dev/null /opt/lonklar-data/server.env
printf 'ADMIN_TOKEN=%s\n' "$ADMIN_TOKEN" | sudo tee /opt/lonklar-data/server.env >/dev/null

previous="lonklar-rollback-$(date +%s)-$$"
has_previous=false
replacement_attempted=false
rollback() {
  result=$?
  trap - EXIT
  if [[ "$result" -ne 0 ]]; then
    if [[ "$replacement_attempted" == true ]]; then
      sudo docker rm -f lonklar || true
    fi
    if [[ "$has_previous" == true ]]; then
      sudo docker rename "$previous" lonklar
      sudo docker start lonklar
      echo 'Previous production container restored after failed deployment.' >&2
    fi
  fi
  exit "$result"
}
trap rollback EXIT
trap 'exit 143' TERM
trap 'exit 130' INT
if sudo docker inspect lonklar >/dev/null 2>&1; then
  sudo docker rename lonklar "$previous"
  has_previous=true
  sudo docker stop "$previous"
fi
replacement_attempted=true
sudo docker run -d --name lonklar --restart unless-stopped \
  -p 8000:8000 \
  -v /opt/lonklar-data/feedback:/app/feedback_data \
  --env-file /opt/lonklar-data/server.env "$image"

healthy=false
for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 3 http://127.0.0.1:8000/ >/dev/null &&
     curl --fail --silent --show-error --max-time 3 http://127.0.0.1:8000/api/meta >/dev/null; then
    healthy=true
    break
  fi
  sleep 1
done
[[ "$healthy" == true ]] || { echo 'Production health checks failed' >&2; exit 1; }

trap - EXIT
if [[ "$has_previous" == true ]]; then
  sudo docker rm "$previous"
fi
# Keep revision-tagged images for operator-selected rollback. Do not prune
# unrelated Docker workloads on this server.
echo "Deployed verified revision $revision"
