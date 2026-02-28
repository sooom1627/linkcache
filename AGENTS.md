# AGENTS.md

> **Note:**  
> This document is for AI agents and LLMs working on this codebase.  
> It provides project context, conventions, and references to ensure consistent, high-quality contributions.

---

## Project Overview

**Knowledge Triage & Growth Space** — A platform where users filter information, align knowledge, and visualize growth through a card-based Swipe UI.

- **Core Flow:** Inbox → Triage (Swipe Right: Read Soon / Swipe Left: Stock) → Action (Read & mark Completed)
- **Mission:** Reduce decision fatigue; transform "saved links" into visible personal progress
- **Strategy:** Build in Public; rapid development and scalability

---

## Technical Stack

| Area | Technology |
|------|-------------|
| Framework | Expo (Managed Workflow) |
| Language | TypeScript (Strict Mode) |
| Styling | NativeWind v3 (Tailwind CSS) |
| State | Local: `useState` / Server: TanStack React Query / Global: React Context + `useReducer` |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| Validation | Zod |
| Navigation | Expo Router (file-based) |
| I18n | i18next (expo-localization) |
| Package Manager | **pnpm** (not npm) |
| Testing | Jest + React Native Testing Library |

---

## Architecture

### Directory Structure

```
├── app/                    # Expo Router (file-based routing)
├── assets/                 # Images, fonts
├── src/
│   ├── features/           # Feature-based modules
│   │   └── [feature-name]/
│   │       ├── api/        # API functions
│   │       ├── contexts/   # Feature-specific Context
│   │       ├── hooks/      # Custom hooks
│   │       ├── components/ # UI components
│   │       ├── screens/     # Screen components
│   │       ├── types/      # Type definitions
│   │       └── index.ts    # Exports
│   ├── shared/             # Shared modules
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── services/
│   └── config/
└── docs/
```

### Key Conventions

- **Feature-based organization:** Group by feature, not by type
- **API layer:** All Supabase/API calls go through `api/` folder
- **No direct Supabase in hooks/components:** Use API functions + React Query
- **Named exports** preferred
- **kebab-case** for directories

---

## Design Principles

1. **Simplicity over Sophistication** — Practical solutions over "elegant" complexity
2. **YAGNI** — Build for today; avoid speculative features
3. **Integration over Fragmentation** — Unified implementations over many small pieces
4. **Minimal Abstraction** — Abstract only after a pattern repeats 3+ times

**Avoid:** Over-splitting hooks, integration-only wrappers, theoretical future-proofing.

---

## Development Workflow

### Feature Implementation (4 Steps)

1. **Data layer:** `types/`, `api/` — Types and API functions
2. **Logic layer:** `hooks/` — Business logic and state
3. **UI layer:** `components/`, `screens/` — UI components
4. **Integration:** `app/` routes, `index.ts` exports

### Verification

- Run `pnpm run check` after each step
- Fix critical issues immediately; defer minor ones for batch refactor

---

## Reference Rules & Skills

| Purpose | Location |
|---------|----------|
| Overall guidelines | `.cursor/rules/cursor-rules.mdc` |
| Business context & MVP scope | `.cursor/rules/business-background-for-this-project.mdc` |
| Architecture & dev flow | `.cursor/rules/react-native-expo-architecture.mdc` |
| Simplicity-first design | `.cursor/rules/simplicity-first-design.mdc` |
| React Native best practices | `.cursor/skills/vercel-react-native-skills/` |
| Data fetching | `.cursor/skills/native-data-fetching/` |
| Supabase / Postgres | `.cursor/skills/supabase-postgres-best-practices/` |

---

## Code Patterns

### API + React Query

```typescript
// api/links.api.ts
export const fetchLinks = async (): Promise<Link[]> => {
  const { data, error } = await supabase.from('links').select('*');
  if (error) throw error;
  return data;
};

// hooks/useLinks.ts
const { data, isLoading, error } = useQuery({
  queryKey: ['links'],
  queryFn: fetchLinks,
});
```

### Styling (NativeWind)

```tsx
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-bold">Title</Text>
</View>
```

### File Naming

- Components: `LinkCard.tsx` (PascalCase)
- Hooks: `useLinks.ts` (camelCase, "use" prefix)
- API: `links.api.ts` (camelCase, ".api" suffix)
- Types: `link.types.ts` (camelCase, ".types" suffix)

---

## Git Conventions

- **Format:** `prefix: message`
- **Prefixes:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- Prefer small, focused commits

---

## Supabase

- Use **Supabase MCP** for database operations
- Link relations to `profiles` table (not `auth.users.id` directly)
- Enforce RLS on all tables

---

## Language

- Respond to the user in **Japanese** when appropriate
- Code comments and variable names may be in English
