# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

LinkCache is a React Native Expo mobile app for knowledge triage. Users save URLs, triage them via swipe UI, and track reading progress. Backend is Supabase (hosted cloud — no local DB).

### Key commands

See `package.json` scripts. Summary:

| Task | Command |
|---|---|
| Install deps | `pnpm install` |
| Lint | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Test | `pnpm test` |
| All checks | `pnpm run check` |
| Dev server | `pnpm expo start --web` or `pnpm start` |
| Format | `pnpm format:fix` |

### Environment variables

A `.env` file is required at the project root with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. These are injected from Cursor Secrets. Tests do **not** require these variables (all Supabase calls are mocked in `jest-setup.ts`).

### Web mode limitation

Running `pnpm expo start --web` produces a "Server Error" due to `react-native-pager-view` importing native-only modules incompatible with web. This is an existing codebase limitation — the app is designed primarily for iOS/Android. The Metro bundler itself works correctly and serves iOS/Android bundles without issues.

### Git hooks

Husky pre-commit hook runs `pnpm run check` (format + lint + typecheck + test). `lint-staged` runs ESLint and Prettier on staged files.

### Testing notes

- All 390 tests pass and are fully mocked (no network/Supabase access needed).
- `console.error` warnings about `act(...)` from React Query tests are pre-existing and harmless.
- Jest may report "A worker process has failed to exit gracefully" — this is a known timer teardown issue and does not affect test results.
