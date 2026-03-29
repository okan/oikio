# AGENTS.md — oikio

## Project Overview

oikio is a **local-first** Electron desktop application for managing 1-1 meeting notes. Users track people (managers, teammates), schedule meetings, take rich-text notes, and manage action items — all stored as a single JSON file on disk with zero cloud dependency.

### Core Domain Entities

| Entity | Description |
|---|---|
| **Person** | A contact with a role (`manager` \| `teammate`), optional job `title`, `goals`, `notes`, meeting frequency goal, and relationship health tracking |
| **Meeting** | A meeting linked to a Person, containing notes (TipTap rich text), talking points, and optional template |
| **ActionItem** | A task linked to a Meeting, with tags, due date, and ownership (`me` \| `other`) |
| **Template** | Reusable meeting note templates with categories (`manager` \| `teammate` \| `general`). Default templates are seeded per locale |
| **MeetingSkip** | Records when a user intentionally skips a meeting cycle for a person |
| **PersonNote** | Timestamped short observations linked to a person (between meetings) |
| **TalkingPoint** | Per-person checklist of topics for the next meeting (`completed` when discussed) |

---

## Tech Stack

| Layer                | Technology                                                          |
| -------------------- | ------------------------------------------------------------------- |
| **UI Framework**     | React 18                                                            |
| **Bundler**          | Vite 6                                                              |
| **Desktop Runtime**  | Electron 35                                                         |
| **Language**         | TypeScript 5 (strict mode)                                          |
| **State Management** | Zustand 4                                                           |
| **Styling**          | TailwindCSS 3 + `tailwind-merge` + `clsx`                           |
| **UI Primitives**    | Radix UI (Dialog, Select, Dropdown, Tabs, Checkbox, Tooltip, Label) |
| **Rich Text Editor** | TipTap 3 (with Placeholder extension)                               |
| **Animations**       | Framer Motion 10                                                    |
| **Icons**            | Lucide React                                                        |
| **Routing**          | react-router-dom 6 (HashRouter for Electron compatibility)          |
| **i18n**             | i18next + react-i18next (EN, TR)                                    |
| **Validation**       | Zod 4                                                               |
| **Notifications**    | sonner (toast) + Electron native Notification                       |

---

## Architecture

### Two-Process Model

```
┌─────────────────────────────────────────────────────┐
│  Renderer Process (React)                           │
│                                                     │
│  Pages → Zustand Stores → Service Layer             │
│                    ↓                                │
│            window.api.*  (contextBridge)            │
└──────────────────┬──────────────────────────────────┘
                   │ IPC (invoke/handle)
┌──────────────────┴──────────────────────────────────┐
│  Main Process (Electron)                            │
│                                                     │
│  IPC Handlers → DatabaseService (facade)            │
│                       ↓                             │
│              Repository classes → DataStore         │
│                                    ↓                │
│                         oikio-data.json (on disk)   │
└─────────────────────────────────────────────────────┘
```

### Frontend Data Flow

1. **Pages** call Zustand store actions (e.g. `usePersonStore().fetchPersons()`)
2. **Zustand stores** delegate to the **service layer** (`src/services/api.ts`)
3. **Service layer** calls `window.api.*` which is exposed by `electron/preload.ts` via `contextBridge`
4. **Preload** forwards calls as `ipcRenderer.invoke('db:entity:method', ...args)`
5. **IPC handlers** (`electron/ipc/`) invoke methods on `DatabaseService`
6. **DatabaseService** is a facade that delegates to **Repository** classes
7. **Repositories** read/write through `DataStore`, which manages the JSON file with debounced persistence

### Security

- `contextIsolation: true`, `nodeIntegration: false`
- All main-process access goes through the `contextBridge` API defined in `preload.ts`

---

## Project Structure

```
oikio/
├── electron/                        # Electron main process
│   ├── main.ts                      # App entry, window creation, service init
│   ├── preload.ts                   # contextBridge API (renderer ↔ main)
│   ├── ipc/                         # IPC handler registrations
│   │   ├── index.ts                 # registerAllHandlers aggregator
│   │   ├── personHandlers.ts
│   │   ├── meetingHandlers.ts
│   │   ├── actionHandlers.ts
│   │   ├── templateHandlers.ts
│   │   ├── meetingSkipHandlers.ts
│   │   ├── personNoteHandlers.ts
│   │   ├── talkingPointHandlers.ts
│   │   ├── dataHandlers.ts          # Export/import/reset
│   │   └── notificationHandlers.ts
│   └── services/
│       ├── database.ts              # Legacy monolithic DB (still referenced)
│       ├── database/                # Refactored modular DB
│       │   ├── index.ts             # DatabaseService facade
│       │   ├── DataStore.ts         # JSON file I/O with debounced save
│       │   ├── types.ts             # DatabaseData, EntityType, defaultData
│       │   ├── PersonRepository.ts
│       │   ├── MeetingRepository.ts
│       │   ├── ActionRepository.ts
│       │   ├── TemplateRepository.ts
│       │   ├── MeetingSkipRepository.ts
│       │   ├── PersonNoteRepository.ts
│       │   ├── TalkingPointRepository.ts
│       │   └── searchQuery.ts       # Global search (plain text + snippets)
│       └── notifications.ts         # Native notification service
├── src/                             # React renderer
│   ├── main.tsx                     # App bootstrap (StrictMode, HashRouter)
│   ├── App.tsx                      # Route definitions, lazy-loaded pages
│   ├── types/index.ts               # All TypeScript interfaces + ElectronAPI
│   ├── services/
│   │   ├── api.ts                   # Service layer wrapping window.api
│   │   └── index.ts
│   ├── store/                       # Zustand stores
│   │   ├── personStore.ts
│   │   ├── meetingStore.ts
│   │   ├── actionStore.ts
│   │   └── templateStore.ts
│   ├── pages/                       # Route-level page components
│   │   ├── Dashboard.tsx
│   │   ├── Persons.tsx
│   │   ├── PersonDetail.tsx
│   │   ├── Meetings.tsx
│   │   ├── MeetingDetail.tsx
│   │   ├── Actions.tsx
│   │   ├── Templates.tsx
│   │   └── Settings.tsx
│   ├── components/
│   │   ├── ui/                      # Reusable primitives (Button, Modal, Input, RichTextEditor, etc.)
│   │   ├── layout/                  # Layout, Navbar, SearchModal, QuickActionModal, KeyboardShortcutsHelp
│   │   ├── person/                  # PersonCard, PersonForm, PersonDetailHeader, PersonNotes, PersonTalkingPoints, PersonMeetingTimeline, PersonReportExport, etc.
│   │   ├── meeting/                 # MeetingCard, MeetingForm, MeetingList, FocusMode
│   │   ├── action/                  # ActionForm, ActionItem, ActionList, ActionProgressSection
│   │   ├── dashboard/               # WelcomeHero, WeeklySchedule, TodayFocus, RelationshipGrid
│   │   └── template/                # TemplateCard, TemplateForm, TemplateList
│   ├── lib/                         # Pure utility functions
│   │   ├── utils.ts                 # cn(), formatDate, getRelativeTime, getInitials, etc.
│   │   ├── relationships.ts         # Relationship health scoring algorithm
│   │   ├── analytics.ts             # Monthly stats and trend calculations
│   │   ├── searchPlainText.ts       # stripHtmlToPlainText, extractMatchSnippet (search)
│   │   ├── personReportMarkdown.ts  # Markdown export for person detail report
│   │   └── tagColors.ts             # Deterministic tag color mapping via hash
│   ├── i18n/
│   │   ├── index.ts                 # i18next configuration
│   │   └── locales/                 # en.json, tr.json
│   └── styles/
│       └── globals.css              # Tailwind directives + global styles
├── vite.config.ts                   # Vite + Electron plugin config, @/ alias
├── tsconfig.json                    # Strict TS, @/ path mapping
├── tailwind.config.js
├── .eslintrc.cjs
└── .prettierrc
```

---

## Key Patterns & Conventions

### Component Organization
- **Domain-based folders** under `src/components/` (person, meeting, action, template, dashboard)
- **Barrel exports** via `index.ts` in every folder — always import from the folder, not the file
- **`ui/` folder** holds generic, reusable primitives (Button, Modal, Input, Select, etc.)

### Zustand Store Pattern
Every store follows the same shape:
- State: `items[]`, `selectedItem`, `isLoading`, `error`
- Actions: `fetch*`, `create*`, `update*`, `delete*`, `clearError`
- All mutations are optimistic in the store after the IPC round-trip succeeds
- Error handling: catch → set error message → re-throw for callers

### Service Layer
`src/services/api.ts` contains thin wrappers (`personService`, `meetingService`, `actionService`, `templateService`, `meetingSkipService`, `personNoteService`, `talkingPointService`) that call `window.api.*`. Stores never call `window.api` directly.

### Repository Pattern (Electron)
`electron/services/database/` uses a clean separation:
- `DataStore` — file I/O, debounced JSON persistence, ID generation
- `*Repository` — domain-specific CRUD logic operating on DataStore
- `DatabaseService` — public facade consumed by IPC handlers

### Lazy Loading
All page components are lazy-loaded via `React.lazy()` with a shared `<Suspense>` fallback in `App.tsx`.

### Path Alias
`@/` maps to `src/` — configured in both `tsconfig.json` and `vite.config.ts`.

### CSS Utility
`cn()` from `src/lib/utils.ts` combines `clsx` + `tailwind-merge` for conditional class composition.

---

## Data Model

```
Person (1) ──→ (N) Meeting (1) ──→ (N) ActionItem
  │                   │
  │                   └── templateId? ──→ Template
  │
  ├── (N) MeetingSkip
  ├── (N) PersonNote
  └── (N) TalkingPoint
```

### Key Fields

- **Person.title** — optional job title (UI label: "Title")
- **Person.goals** — optional career / development notes
- **Person.notes** — optional personal reminders
- **Person.meetingFrequencyGoal** — `weekly | biweekly | monthly | quarterly` — drives relationship health scoring
- **Person.lastMeetingDate** — denormalized, auto-updated when meetings are created/updated/deleted
- **Person.skippedUntil** — set when a MeetingSkip is created
- **ActionItem.assignedTo** — `me | other`
- **ActionItem.tags** — freeform string array with deterministic color mapping
- **ActionItem.progressNotes** — optional chronological `{ id, text, createdAt }[]`; appended via `ActionRepository.addProgressNote` / IPC `db:actions:addProgressNote`
- **Template.isDefault** — system-seeded templates (locale-aware, cannot be exported)
- **Meeting.mood** — optional `1 | 2 | 3 | 4 | 5` (1 hardest, 5 best); set from Focus Mode header, meeting sidebar, or cleared via `MoodSelector`

### Persistence
All data is stored in `oikio-data.json` at Electron's `userData` path. The file includes a `meta.lastId` map for auto-incrementing IDs per entity. Export/import includes `personNotes` and `talkingPoints`; deleting a person cascades notes and talking points via repositories.

---

## Coding Style

| Rule           | Value                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------ |
| Semicolons     | None                                                                                       |
| Quotes         | Single                                                                                     |
| Indent         | 2 spaces                                                                                   |
| Trailing comma | ES5                                                                                        |
| Print width    | 100                                                                                        |
| Comments       | Do not add comments anywhere                                                               |
| TypeScript     | Strict mode enabled (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`) |
| Linter         | ESLint with `@typescript-eslint`, `react-hooks`, `react-refresh` plugins                   |
| Unused args    | Prefix with `_` (e.g. `(_event, id)`)                                                      |

### Naming Conventions
- Components: PascalCase (`PersonCard.tsx`)
- Stores: camelCase with `use` prefix (`usePersonStore`)
- Services: camelCase object literals (`personService`)
- IPC channels: colon-delimited (`db:persons:getAll`)
- Types/Interfaces: PascalCase, no `I` prefix

---

## Internationalization (i18n)

- Two locales: `en.json` and `tr.json` in `src/i18n/locales/`
- Language preference stored in `localStorage` under key `oikio-language`
- Fallback language: `en`
- Access translations via `useTranslation()` hook from `react-i18next`
- Date/time formatting uses locale-aware `Intl.DateTimeFormat` (see `src/lib/utils.ts`)
- `getRelativeTime` and `isOverdue` in `src/lib/utils.ts` compare dates by local calendar day (midnight-normalized)
- Default templates in `electron/services/database.ts` are seeded based on system locale

---

## Development Commands

| Command                | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Start Vite dev server (web-only preview)           |
| `npm run electron:dev` | Start Vite + Electron in dev mode                  |
| `npm run build`        | TypeScript compile + Vite build + electron-builder |
| `npm run lint`         | ESLint check                                       |
| `npm run format`       | Prettier format                                    |

---

## Important Implementation Details

### Relationship Health Scoring (`src/lib/relationships.ts`)
- Compares `daysSinceLastMeeting` against the person's `meetingFrequencyGoal` threshold when a goal exists
- Returns a `RelationshipHealth` object with `score`, `status` (good/warning/critical/neutral), `isOverdue`, `isSkipped`
- Persons with a last meeting but no frequency goal use `neutral` (not critical)
- Thresholds: weekly=7, biweekly=14, monthly=30, quarterly=90 days
- Warning at 80% of threshold, critical when exceeded
- Active skip overrides status to `good`

### Notification System (`electron/services/notifications.ts`)
- Runs a 30-minute interval check in the main process
- Meeting reminders: any upcoming meeting within `reminderHoursBefore` (range-based); each meeting reminded at most once per occurrence (`oikio-notification-state.json` tracks sent meeting IDs, pruned after the meeting day)
- Action summary: at most once per local calendar day when there are overdue or due-today items
- Uses Electron's native `Notification` API

### Focus Mode (`src/components/meeting/FocusMode.tsx`)
- Full-screen notes + sidebar with **Actions** and **Prep** tabs
- Prep tab: open talking points (toggle complete), read-only quick notes (`PersonNote`), pending actions from other meetings for the same person
- Header **How did it go?** (`MoodSelector`): five-step mood saved immediately via `updateMeeting`

### Person Markdown report (`src/lib/personReportMarkdown.ts`, `PersonReportExport.tsx`)
- Person detail sidebar: date range + download `.md` (Blob + `a[download]`, same pattern as Settings JSON export)
- Includes profile, meetings in range (mood, notes as plain text, actions with progress notes), quick notes and talking points filtered by `createdAt`, skips filtered by `skippedAt`

### Search (`electron/services/database/searchQuery.ts`, `src/lib/searchPlainText.ts`)
- Global search matches meeting notes, talking points, next topics, and person text fields using **plain text** after `stripHtmlToPlainText` (TipTap HTML)
- Action **progress notes** and **tags** are included; results may include `searchSnippet` for preview in `SearchModal`

### Keyboard Shortcuts (handled in `src/components/layout/Layout.tsx`)
- `Cmd/Ctrl + K` — Open search
- `Cmd/Ctrl + Shift + A` — Quick action modal
- `Cmd/Ctrl + N` — New meeting
- `Cmd/Ctrl + Shift + N` — New person
- `Cmd/Ctrl + /` — Keyboard shortcuts help
- Shortcuts are suppressed when focus is in input/textarea/contenteditable elements

### Data Export/Import
- Export serializes all data except default templates, including `meetingSkips`, `personNotes`, and `talkingPoints`
- Import preserves default templates, restores `meetingSkips`, `personNotes`, and `talkingPoints`, and recalculates `meta.lastId` counters
- Deleting a person removes their `meetingSkips`, `personNotes`, and `talkingPoints` via repository cascade
- Reset restores to `defaultData` and re-seeds templates

### Analytics (`src/lib/analytics.ts`)
- Computes 6-month rolling monthly stats (meetings count, actions created/completed)
- Calculates meeting trend (month-over-month %), average meetings per week, action completion rate

### Weekly schedule (`src/lib/weeklySchedule.ts`, `WeeklySchedule.tsx`)
- Dashboard card groups meetings by local calendar day for the ISO-style week (Monday–Sunday) containing “today”
- `parseMeetingLocalDate` parses `YYYY-MM-DD` as local midnight to avoid UTC day shifts

### Next meeting suggestion (`src/lib/meetingSchedule.ts`)
- `calculateNextMeetingDate(person)` — steps forward from `lastMeetingDate` by `meetingFrequencyGoal` interval (default 7 days if no goal) until on/after today; respects active `skippedUntil` (first allowed day after skip)
- `pickDefaultTemplateForPerson` — first template matching person `role` or `general`, same ordering as `MeetingForm`
- Person detail **Schedule next** opens `MeetingForm` with `defaultDate` / `defaultTemplateId`

### Tag Colors (`src/lib/tagColors.ts`)
- Deterministic color assignment: hash-based mapping from tag name to a palette of 16 TailwindCSS color sets
- Ensures the same tag always renders the same color across the app
