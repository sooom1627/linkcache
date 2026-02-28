# AGENTS.md

<!--
  Target: AI coding agents (Cursor, Claude, etc.)
  Purpose: Lightweight project briefing. Rules/skills hold details—link, don't duplicate.
  Budget: ~80 lines. Every token loads on every request.
-->

## Project

**Knowledge Triage & Growth Space** — Expo app for triaging links via Swipe UI (Inbox → Read Soon/Stock → Completed). Supabase backend.

---

## Rule Compliance

**MUST** follow all rules in `.cursor/rules/`. They are `alwaysApply: true`—treat as mandatory.

| Rule | Scope |
|------|-------|
| `cursor-rules.mdc` | Core principles, stack, TDD, code style |
| `business-background-for-this-project.mdc` | MVP scope, UX, data schema |
| `react-native-expo-architecture.mdc` | Feature structure, 4-step dev flow |
| `simplicity-first-design.mdc` | YAGNI, avoid over-abstraction |

---

## Skills: When to Use

**Read the skill's SKILL.md** before implementing. Do not skip.

| Trigger | Skill Path | Read When |
|---------|------------|-----------|
| Network/API/fetch/React Query | `.cursor/skills/native-data-fetching/SKILL.md` | ANY data fetching |
| React Native components, lists, animations | `.cursor/skills/vercel-react-native-skills/SKILL.md` | UI work |
| SQL, schema, RLS, Postgres | `.cursor/skills/supabase-postgres-best-practices/SKILL.md` | DB work |
| Expo upgrade, SDK | `.cursor/skills/upgrading-expo/SKILL.md` | SDK/dep changes |

---

## Commands

| Action | Command |
|--------|---------|
| Install | `pnpm install` |
| Dev | `pnpm expo start` |
| Verify | `pnpm run check` |
| Test | `pnpm test` |

---

## Critical Conventions

1. **pnpm** only (never npm)
2. **API layer:** All Supabase/API → `src/features/*/api/`; hooks use React Query
3. **Feature structure:** `api/`, `hooks/`, `components/`, `screens/`, `types/`
4. **Supabase:** Use MCP; relations → `profiles`; RLS on all tables
5. **Git:** `prefix: message` — feat, fix, docs, refactor, test, chore
6. **Language:** Respond to user in Japanese; code in English
