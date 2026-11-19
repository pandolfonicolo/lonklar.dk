# Isolated Cloudflare test deployment — not production

Do not deploy until the user has approved the GitHub/Cloudflare authorization,
reviewed its scopes and created a NEW empty D1 database. Do not reuse the Python
PoC or any live database. Neither a build nor this document migrates data.

Workers Builds fields for a **separate** Worker:

- Worker name: `lonklar-native-ts-preview`
- Repository: `pandolfonicolo/lonklar.dk`
- Deployment branch: `codex/native-typescript-worker-preview` (not `main`)
- Root directory: `workers_ts`
- Build command: `npm run build:preview`
- Deploy command: `npx wrangler deploy --config wrangler.preview.json`
- Disable builds for other branches; do not use default `wrangler preview`.
- Build variable: `PREVIEW_D1_DATABASE_ID` = UUID of the verified new empty test DB.
- Use Node 24 or newer. Existing npm lockfiles pin dependencies.

Before deployment, initialize **only the new test D1** in its dashboard SQL
console using `migrations/0001_feedback.sql`. This requires no D1 API credential
inside the build. Confirm rate-limit namespace `130001` is not already assigned
to another logical rate limit in the account. If it is, choose a separate namespace
in `scripts/preview-build-utils.mjs` before deployment.

The generated configuration uses workers.dev, no custom domains/routes/triggers,
no admin secret, an empty cross-origin allowlist and only the new test D1 binding.
The frontend build is copied into a separate preview output; production analytics
and SEO metadata are removed, robots disallows indexing, and responses have
X-Robots-Tag. **The URL is public: noindex is not access control.** Use synthetic
inputs only; no real feedback or financial data. The source frontend is unchanged.

Do not accept broad default token permissions blindly. Have the user approve a
reviewed authorization scoped to the existing preview Worker. No payments, paid
plan changes, DNS changes or real-data migration are authorized by these steps.
The new config is local/generated and ignored by Git; it cannot deploy before the
explicit database build variable is supplied. The build never provisions resources,
executes migrations or deploys. Do not publish its local dummy test config.

After deployment verify root/deep links, all calculator flows, feedback against
only the test DB, admin rejection, no production analytics requests, and measured
hosted first/warm response times. Keep Oracle, its Umami service, main and PR status
unchanged. Local runtime times are not hosted latency or billable CPU measurements.
