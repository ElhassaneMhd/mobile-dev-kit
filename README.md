# Hodour Mobile Kit

Reusable components, hooks, services, and architecture extracted from the Hodour mobile app (Expo + React Native + NativeWind + gluestack-ui). Use this kit to bootstrap or extend another Expo project.

## Stack requirements

The kit assumes the target project uses:

- Expo (SDK 52+) with expo-router
- TypeScript with the `@/*` path alias (see Integration step 2)
- NativeWind 4 + Tailwind CSS (styling)
- gluestack-ui (primitive components)
- TanStack Query (server state) + Zustand (client state)
- react-hook-form + zod-style schemas for forms

Reference dependency versions are in `config/reference-package.json`.

## Folder map

| Folder | Contents | Coupling |
| --- | --- | --- |
| `components/ui/` | Generic UI primitives: buttons, badges, cards, skeleton, select, menu, drawer, fab, map views, date picker, empty/error states, TabBar, SafeAreaWrapper | Generic — reusable as-is |
| `components/schema-forms/` | Schema-driven form system (`FormModal`, `FormScreen`, `GenericFormModal`). Has its own `README.md` | Generic |
| `components/` (root) | `AppSidebar`, `ErrorBoundary`, `QuickActionsFab`, `StickyHeader`, `modals/PremiumModal` | Semi-generic (navigation entries are Hodour-specific — edit the menu items) |
| `contexts/` | `ThemeContext`, `UIContext`, `AppStateContext`, `NotificationWebSocketContext` | Theme/UI generic; WebSocket context tied to Hodour backend |
| `hooks/` | `useAppTheme`, `useAuth`, `useNetworkStatus`, `useWebSocket`, `useLocationTracking`, plus domain hooks (`use-grades`, `use-attendance`, ...) | Mixed — see "Generic vs domain" below |
| `services/` | `BaseApiService` (axios wrapper: auth headers, refresh, retries), `tokenStorage`, `NetworkManager`, `websocketService`, plus domain services | `BaseApiService`/`tokenStorage`/`NetworkManager` are the reusable core |
| `utils/` | `responsive.ts`, `spacing.ts`, `precision.ts`, `validation.ts`, `errorUtils.ts`, `secureStorage.ts`, `biometric.ts`, `notifications.ts`, `cloudinary.ts` | Generic |
| `constants/` | `theme.ts` (colors, typography), `icons.ts`, `formSchemas.ts` | Theme generic; formSchemas Hodour-specific |
| `types/` | Shared TypeScript types | Mostly Hodour domain types |
| `env/` | Environment config module (`env.dev.ts` / `env.prod.ts`) consumed by services | Generic pattern — edit URLs |
| `config/` | `tailwind.config.js`, `gluestack-ui.config.json`, `babel.config.js`, `metro.config.js`, `global.css`, `tsconfig.json`, `app.json`, `reference-package.json` | Merge into target project |

## Integration into an existing project

Because your new project already has files, **merge, don't overwrite**:

### 1. Install dependencies

Diff `config/reference-package.json` against your project's `package.json` and install what's missing. Minimum for the UI kit:

```bash
npx expo install nativewind tailwindcss react-native-reanimated react-native-safe-area-context react-native-svg
npm i @gluestack-ui/button @gluestack-ui/select @gluestack-ui/menu @gluestack-ui/fab @gluestack-ui/modal @gluestack-ui/toast @gluestack-ui/nativewind-utils @legendapp/motion @expo/vector-icons
```

For services/hooks add: `axios @tanstack/react-query zustand expo-secure-store @react-native-community/netinfo`.
For maps/location: `react-native-maps expo-location`. For forms: `react-hook-form @hookform/resolvers`.

### 2. Path alias

All internal imports use `@/...` pointing at the app root. In the target `tsconfig.json`:

```json
{ "compilerOptions": { "paths": { "@/*": ["./*"] } } }
```

and in `babel.config.js` use `babel-plugin-module-resolver` with the same alias (see `config/babel.config.js`).

If your project puts source under `src/`, either alias `@/* -> ./src/*` and copy folders into `src/`, or run a find/replace on imports.

### 3. Merge configs

- **tailwind.config.js**: copy the `theme.extend` (colors, fonts) and ensure `content` globs cover `components/**`. Keep your existing entries.
- **global.css**: append the kit's CSS variables/layers to yours.
- **metro.config.js / babel.config.js**: merge NativeWind + module-resolver setup if not already present.
- **gluestack-ui.config.json**: copy if you don't have one.

### 4. Copy folders (collision strategy)

Copy in this order, skipping anything you already have a better version of:

1. `constants/theme.ts`, `utils/`, `env/` — foundations, few collisions expected.
2. `contexts/ThemeContext.tsx` + `hooks/useAppTheme.ts` — the theme system most UI components depend on. If you already have a theme provider, adapt `useAppTheme` to read from yours instead (it's the single choke point).
3. `components/ui/` — if a component name collides with an existing one, keep yours and rename the kit's (e.g. `HdrButton`), or drop the kit copy.
4. `services/BaseApiService.ts`, `tokenStorage.ts`, `NetworkManager.ts` — API core. Point `env/env.dev.ts` at your backend URL.
5. `components/schema-forms/` — optional; read its own README first.
6. Domain hooks/services/types — only if the new project talks to the same Hodour backend; otherwise use them as templates.

### 5. Wire providers

In your root layout (`app/_layout.tsx`):

```tsx
<GluestackUIProvider>            // components/ui/gluestack-ui-provider
  <ThemeProvider>                // contexts/ThemeContext
    <QueryClientProvider client={queryClient}>
      <UIProvider>{children}</UIProvider>
    </QueryClientProvider>
  </ThemeProvider>
</GluestackUIProvider>
```

### 6. Verify

Run `npx tsc --noEmit`. Remaining errors are almost always: missing dependency, missing `@/` alias, or a domain type you didn't copy — fix by copying the referenced file from this kit or deleting the unused import.

## Generic vs domain-specific

**Safe to reuse anywhere:** everything in `components/ui/` and `components/schema-forms/`, `utils/`, `constants/theme.ts`, `contexts/ThemeContext` + `UIContext`, `hooks/useAppTheme`, `useNetworkStatus`, `useLocationTracking`, `services/BaseApiService`, `tokenStorage`, `NetworkManager`.

**Hodour-specific (use as templates):** `use-grades`, `use-attendance`, `use-justifications`, `use-recommendations`, `use-timetable`, `use-professor`, their matching services, `types/fsr-student.ts`, `types/grade.ts`, `constants/formSchemas.ts`, `NotificationWebSocketContext`, `AppSidebar` menu entries.

## Key component usage

```tsx
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SafeAreaWrapper } from "@/components/ui/SafeAreaWrapper";
import { useAppTheme } from "@/hooks/useAppTheme";

function Screen() {
  const { colors, isDark } = useAppTheme();
  return (
    <SafeAreaWrapper>
      <StatCard title="Sessions" value={12} />
      <StatusBadge status="PRESENT" />
      <EmptyState title="Nothing here" description="Add your first item" />
    </SafeAreaWrapper>
  );
}
```

API service pattern — extend `BaseApiService` for each domain:

```ts
import { BaseApiService } from "@/services/BaseApiService";

class CourseService extends BaseApiService {
  getCourses() { return this.get("/courses"); }
}
export const courseService = new CourseService();
```

Then wrap in a TanStack Query hook (see `hooks/use-grades.ts` for the pattern).
