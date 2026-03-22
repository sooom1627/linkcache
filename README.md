# linkcache

A **Knowledge Triage & Growth Space** app built with Expo (React Native).
Quickly save links and organize them through a **Swipe UI**: Inbox → Read Soon / Stock → Completed.

---

## Features

- Add links via URL paste with automatic OGP metadata fetching
- Swipe-based triage (Inbox → Read Soon / Stock → Completed)
- Collections for organizing saved links
- Link detail view with status tracking and read history
- Authentication via Supabase Auth (email/password + OAuth)
- iOS Share Extension — capture links directly from any app

---

## Tech Stack

| Category        | Technology                          |
| --------------- | ----------------------------------- |
| Framework       | Expo (Managed Workflow)             |
| Language        | TypeScript (Strict Mode)            |
| Routing         | Expo Router (file-based)            |
| Server State    | TanStack React Query                |
| Backend / Auth  | Supabase (Database, Auth, Storage)  |
| Validation      | Zod                                 |
| Styling         | NativeWind v4 (Tailwind CSS)        |
| Testing         | Jest + React Native Testing Library |
| Package Manager | pnpm                                |

---

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required keys:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Optional:

- `APP_ENV=dev` — switches bundle identifier and URL scheme to the development variant

### 3. Start the app

```bash
pnpm expo start
```

---

## Development Commands

| Command           | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `pnpm expo start` | Start the Expo dev server                                |
| `pnpm test`       | Run the test suite                                       |
| `pnpm typecheck`  | TypeScript type check                                    |
| `pnpm lint`       | ESLint                                                   |
| `pnpm run check`  | format:fix + lint + typecheck + test (full verification) |

---

## Architecture

### System Overview

```mermaid
graph TD
    User["User (iOS)"]
    App["Expo App (React Native)"]
    ShareExt["iOS Share Extension"]
    AppGroup["App Group\n(AsyncStorage)"]
    Supabase["Supabase"]
    SupabaseAuth["Auth"]
    SupabaseDB["Database\n(PostgreSQL + RLS)"]
    SupabaseStorage["Storage\n(Avatars)"]
    OGP["External Websites\n(OGP Metadata)"]

    User -->|"opens app"| App
    User -->|"shares URL"| ShareExt
    ShareExt -->|"writes shared item"| AppGroup
    AppGroup -->|"useSharedLinkSync"| App
    App -->|"sign in / session"| SupabaseAuth
    App -->|"RPC / queries"| SupabaseDB
    App -->|"upload/download"| SupabaseStorage
    App -->|"fetch metadata"| OGP

    Supabase --- SupabaseAuth
    Supabase --- SupabaseDB
    Supabase --- SupabaseStorage
```

### Screen Navigation

```mermaid
graph LR
    Root["Root Layout\n(_layout.tsx)"]
    SignIn["sign-in.tsx\n(public)"]
    CreateAccount["create-account.tsx\n(public)"]
    Protected["(protected) Layout\nauth guard"]
    Tabs["(tabs) Layout\nbottom tab bar"]
    Home["Home\n/(home)"]
    Swipes["Swipes\n/(swipes)"]
    LinkList["Link List\n/(list)"]
    Dashboard["Dashboard\n/(dashboard)"]
    LinkDetail["Link Detail\n/link/[id]"]
    LinksIndex["Uncollected Links\n/links/un-collectioned"]
    CollectionList["Collections\n/collections"]
    CollectionDetail["Collection Detail\n/collections/[id]"]
    CreateModal["LinkCreate Modal\n(bottom sheet)"]

    Root --> SignIn
    Root --> CreateAccount
    Root --> Protected
    Protected --> Tabs
    Tabs --> Home
    Tabs --> Swipes
    Tabs --> LinkList
    Tabs --> Dashboard
    Tabs -->|"+ button"| CreateModal
    Protected --> LinkDetail
    Protected --> LinksIndex
    Protected --> CollectionList
    Protected --> CollectionDetail
```

### Database Schema

```mermaid
erDiagram
    auth_users {
        uuid id PK
    }
    users {
        uuid id PK
        uuid user_id FK
        text username
        text avatar_url
        timestamp created_at
        timestamp updated_at
    }
    links {
        uuid id PK
        text url
        text title
        text description
        text image_url
        text favicon_url
        text site_name
        timestamp created_at
        timestamp updated_at
    }
    link_status {
        uuid id PK
        uuid link_id FK
        uuid user_id FK
        text status
        timestamp read_at
        timestamp triaged_at
        timestamp created_at
        timestamp updated_at
    }
    collections {
        uuid id PK
        uuid user_id FK
        text name
        text emoji
        timestamp created_at
        timestamp updated_at
    }
    collection_links {
        uuid collection_id FK
        uuid link_id FK
    }

    auth_users ||--|| users : "profile"
    users ||--o{ link_status : "triages"
    users ||--o{ collections : "creates"
    links ||--o{ link_status : "tracked by"
    links ||--o{ collection_links : "belongs to"
    collections ||--o{ collection_links : "contains"
```

> `link_status.status` values: `new` | `read_soon` | `stock` | `done`

### Link Triage State Machine

```mermaid
stateDiagram-v2
    [*] --> new : Add link (paste URL / Share Extension)
    new --> read_soon : Swipe right
    new --> stock : Swipe left
    new --> done : Mark complete directly
    read_soon --> done : Mark complete
    stock --> done : Mark complete
    done --> [*]
```

### State Management Layers

```mermaid
graph TD
    subgraph "Provider Stack (outermost → innermost)"
        UI["UIProviders\n(GestureHandler, SafeArea, BottomSheet)"]
        QC["QueryClientProvider\n(TanStack React Query)"]
        Auth["AuthProvider\n(Context + useReducer)"]
        ShareProc["SharedLinkProcessor\n(iOS Share Extension sync)"]
        Modal["ModalProvider\n(global modal management)"]
    end

    subgraph "State Layers"
        Server["Server State\n(React Query)\nLinks, Collections, Profile"]
        Global["Global State\n(Context + useReducer)\nAuth session, modals"]
        Local["Local State\n(useState)\nForms, filters, UI toggles"]
    end

    UI --> QC --> Auth --> ShareProc --> Modal
    QC --> Server
    Auth --> Global
    Modal --> Local
```

---

## Directory Structure

```text
.
├── app/                        # Expo Router file-based routes
│   ├── _layout.tsx             # Root layout with all providers
│   ├── sign-in.tsx             # Public sign-in screen
│   ├── create-account.tsx      # Public sign-up screen
│   └── (protected)/            # Auth-guarded routes
│       ├── _layout.tsx         # Auth guard (redirects if not signed in)
│       ├── (tabs)/             # Bottom tab navigation (4 tabs)
│       │   ├── (home)/         # Home screen
│       │   ├── (swipes)/       # Swipe triage screen
│       │   ├── (list)/         # Link list screen
│       │   └── (dashboard)/    # Dashboard / stats
│       ├── link/[id].tsx       # Link detail (dynamic route)
│       ├── links/              # Uncollected links sub-routes
│       └── collections/        # Collection list + detail sub-routes
│
├── src/
│   ├── features/               # Business logic, organized by feature
│   │   ├── auth/               # Authentication (sign-in, sign-up, OAuth, session)
│   │   ├── links/              # Link management, swipe triage, collections (core feature)
│   │   ├── users/              # User profile and settings
│   │   └── share-extension/    # iOS Share Extension integration
│   │
│   └── shared/                 # Shared infrastructure
│       ├── components/         # Reusable UI components
│       ├── providers/          # App-level providers (Auth, Query, Modal, UI)
│       ├── hooks/              # Shared hooks (useDebounce, useDateTime, etc.)
│       ├── lib/                # Supabase client (with expo-secure-store session)
│       ├── utils/              # i18n, toast, timezone, file utilities
│       └── constants/          # Colors, locales, languages
│
├── supabase/
│   └── migrations/             # SQL migration files (Supabase RPC functions, views)
│
├── plugins/
│   └── withShareExtension.ts   # Custom Expo plugin for iOS Share Extension
│
└── targets/                    # iOS Share Extension native target
```

Each feature follows this internal structure:

```text
features/<name>/
├── api/          # Supabase/API calls (never called directly from UI)
├── hooks/        # React Query hooks wrapping the API layer
├── components/   # Feature-specific UI components
├── screens/      # Full screen compositions
├── types/        # TypeScript types and Zod schemas
└── __tests__/    # Tests (Classical TDD: Jest + RNTL)
```

---

## Notes

- **iOS Share Extension**: Configuration is in `app.config.js` and `plugins/withShareExtension.ts`. The extension communicates with the main app via an App Group.
- **Build variants**: `APP_ENV=dev` switches the bundle identifier and URL scheme, so be careful when running production builds locally.
- **Session storage**: Supabase sessions are persisted securely via `expo-secure-store` (not AsyncStorage).
- **React Query tuning**: `staleTime: 30min`, `gcTime: 60min`, `refetchOnWindowFocus: false` — optimized to minimize Supabase egress on mobile.
