# Production Rollout Notes

Date: 2026-05-04

This note records the production fixes applied after syncing upstream changes.
It focuses on Redis rate limiting and OpenAI-compatible AI generation.

## Scope

Commits included:

- `00fa4d7d` - Fix Upstash Redis REST URL handling
- `90b4f1ea` - Use chat completions for OpenAI-compatible base URLs
- `7f576a56` - Send api-key header for OpenAI-compatible providers

## Redis Rate Limiting

Changed file:

- `src/app/config.ts`

Problem:

- Vercel/Upstash can expose both Redis TCP URLs and REST URLs.
- `@upstash/redis` requires an HTTPS REST URL.
- After syncing upstream, the build failed when `KV_URL` had a `rediss://...`
  value and was passed to the Upstash Redis REST client.

Fix:

- Prefer REST Redis variables before TCP variables:
  - `KV_REST_API_URL`
  - `EXIF_KV_REST_API_URL`
  - `UPSTASH_REDIS_REST_URL`
  - `KV_URL`
- Only enable Redis storage when the selected URL starts with `https://`.
- If only `rediss://...` is present, Redis rate limiting is treated as
  unavailable instead of failing the build.

Expected behavior:

- Builds no longer fail because of a `rediss://` Redis URL.
- External-service rate limiting is enabled only when a valid HTTPS Upstash
  REST URL and token are configured.

Restore options:

- Environment-only restore:
  - Configure `KV_REST_API_URL` and `KV_REST_API_TOKEN` in Vercel.
  - Or configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- Code rollback:
  - Revert commit `00fa4d7d`.
  - Only do this if the deployment environment always provides an HTTPS Redis
    REST URL before any `rediss://` variable.

## AI Provider Compatibility

Changed file:

- `src/platforms/openai.ts`

Problem:

- Newer `@ai-sdk/openai` defaults to the OpenAI Responses API when calling
  `openai(MODEL)`.
- MiMo's OpenAI-compatible API supports `/v1/chat/completions`, not
  `/v1/responses`.
- MiMo documentation also shows authentication with an `api-key` header.

Fix:

- When `OPENAI_BASE_URL` is configured, use `openai.chat(MODEL)` so requests
  go to `/v1/chat/completions`.
- When `OPENAI_BASE_URL` is not configured, keep the default OpenAI Responses
  API behavior.
- When `OPENAI_BASE_URL` is configured, send both:
  - `Authorization: Bearer <OPENAI_SECRET_KEY>`
  - `api-key: <OPENAI_SECRET_KEY>`

Production environment used for MiMo:

- `OPENAI_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1`
- `OPENAI_MODEL=mimo-v2.5`
- `OPENAI_SECRET_KEY=<MiMo API key>`

Expected behavior:

- MiMo AI image/text requests use:
  - `POST /v1/chat/completions`
  - model `mimo-v2.5`
- The previous `/v1/responses` 404 error should not recur.
- If the API key is invalid or mismatched with the endpoint, MiMo returns 401.

Restore options:

- Environment-only disable:
  - Remove `OPENAI_SECRET_KEY`, or set `AI_TEXT_AUTO_GENERATED_FIELDS=none`.
  - This disables AI-generated text during photo sync while keeping photo/EXIF
    sync usable.
- Return to native OpenAI behavior:
  - Remove `OPENAI_BASE_URL`.
  - Set `OPENAI_MODEL` to a native OpenAI model, or remove it to use the
    project default.
- Code rollback:
  - Revert commits `90b4f1ea` and `7f576a56`.
  - Only do this if the provider supports the OpenAI Responses API or the
    project is using native OpenAI only.

## Verification

Build verification:

- `corepack pnpm run build`

Notes:

- Local builds may print Postgres `ECONNREFUSED` logs when no local database is
  running. These logs did not block the build.

Runtime verification:

- In Vercel runtime logs, confirm AI requests use:
  - `https://token-plan-cn.xiaomimimo.com/v1/chat/completions`
  - `model: mimo-v2.5`
- Confirm no Redis build error appears with `rediss://...`.
- Test AI with a small admin action before running a large photo sync batch.

## Operational Caution

The admin photo update flow processes photos in batches of 3 from the browser.
For large update counts, keep the browser open. If AI is enabled and many
photos are missing AI text fields, the sync can consume provider quota.

