# Project discovery — nagm_lst (nagm.io)

The full cross-repository knowledge base lives in the **backend** repository at
[`nagmdev/backend` → `docs/project-discovery/`](https://github.com/nagmdev/backend/tree/main/docs/project-discovery)
(until merged, on branch `claude/adoring-bell-0jetn9`). It was produced on 2026-10-13 against this repo at `575bc2b` by a read-only review; nothing in this repository's code was changed.

## ⚠️ Action required

This repository's git history contains a since-deleted environment file with **non-placeholder values for an SMTP password and an AI-provider API key**. The values were not copied anywhere. Rotate both credentials; if this repository is or was ever public, also purge the history and enable secret scanning. The exact commit and remediation steps are in the backend repo, `docs/project-discovery/11-security-review.md` (SEC-01).

## Documents most relevant to this repo

| Topic | Backend-repo path |
|---|---|
| Routes, sign-up/sign-in flows, hand-off, gaps | `docs/project-discovery/04-frontend-and-user-journeys.md` §1 |
| Marketing claims compared with the real product | `docs/project-discovery/14-cross-system-findings.md` §1 |
| Hand-off sequence (nagm.io → app.nagm.io) | `docs/project-discovery/09-integrations-and-external-services.md` §6 |
| Full file-by-file review of `star/` (raw evidence) | `docs/project-discovery/evidence/landing-nagm-io.md` |
| Security items for this repo (no security headers, credentials in history, nonce cookie) | `docs/project-discovery/11-security-review.md` |
| Env vars (`VITE_BACKEND_API`, `VITE_APP_ORIGIN`, `VITE_BACKEND_URL`) | `docs/project-discovery/15-configuration-reference.md` §3 |

## Headline facts for this repo (2026-10-13)

- The app lives in `star/`; the root `package.json`/`vercel.json` only build it. `star/dist/` is committed and stale relative to `star/src` (Vercel rebuilds from source).
- Sign-up offers three roles (Candidate, Recruiter, Company); no token is persisted; the hand-off code travels in the URL fragment and is bound to an `h_nonce` cookie.
- `vercel.json` sets no security headers (no CSP, no frame protection).
- `VITE_BACKEND_API` is read from `process.env` in `vite.config.ts`, so a value placed only in `star/.env` is ignored and local dev talks to the production API.
- Pricing, WhatsApp, pgvector, OCR and compliance claims on the landing pages are not backed by code.
