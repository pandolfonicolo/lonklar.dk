# Security Policy

## Reporting a Vulnerability

If you discover a security issue, please report it privately via GitHub's
[Security Advisories](https://github.com/pandolfonicolo/lonklar.dk/security/advisories/new)
feature, or email the maintainer directly. Do not open a public issue.

We aim to acknowledge reports within 48 hours and provide a fix or mitigation
within 7 days.

## Scope

This project is a **read-only tax calculator** with no authentication, no user
accounts, and no payment processing. The attack surface is limited to:

- Unauthenticated feedback/vote endpoints (rate-limited, validated)
- Static frontend served from the same origin
- Self-hosted Umami analytics (separate Docker container)

## Security Measures

| Area | Measure |
|------|---------|
| **Secrets** | No secrets in repo; all credentials via `.env` / env vars |
| **CORS** | Explicit origin allowlist (no wildcards) |
| **Rate limiting** | slowapi per-IP limits on all write endpoints |
| **Input validation** | Pydantic models with field-length caps, enum validation, payload size limits |
| **Feedback storage** | Date-stamped JSONL files, hardcoded filenames (no path injection), no PII collected |
| **Umami** | DB credentials via env vars, port bound to localhost only |
| **HTTPS** | Caddy with auto-renewed Let's Encrypt certificates |
| **Git history** | Scrubbed of any previously-committed data files |

## Dependencies

We pin minimum versions in `requirements.txt` and `package.json`. Please report
any known-vulnerable dependency via the process above.
