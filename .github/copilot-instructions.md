# Copilot Instructions for Senior Project Frontend

## Project Overview

Next.js 15.5+ cryptocurrency portfolio tracker with NextAuth.js authentication, integrating Alchemy blockchain APIs and CoinGecko market data. Uses App Router with TypeScript, Tailwind CSS v4, and shadcn/ui components (built on Radix UI).

**Package Manager**: This project uses **Bun** as the package manager. Always use `bun` commands instead of `npm`/`yarn`/`pnpm`.

## Architecture

### Three-Layer Pattern

1. **API Routes** (`src/app/api/**/route.ts`): Validate input, call service layer
2. **Services** (`src/services/**/*.ts`): Marked `"use server"`, handle external API calls (Alchemy, CoinGecko, backend)
3. **Components**: Client components (`"use client"`) consume services via API routes or direct server actions

### Key Integrations

- **Backend API**: User/wallet management at `env.BACKEND_URL`
- **Alchemy**: Multi-chain portfolio/transaction data via `env.ALCHEMY_DATA_URL`
- **CoinGecko**: Market data and pricing via `env.COINGECKO_API_URL`

### Authentication Flow

NextAuth.js (v5 beta) with GitHub/Google providers. Custom callbacks in `src/auth.ts`:

1. `signIn`: Calls `loginUser()` service to register/login user in backend
2. `jwt`: Enriches token with user data from `getUser()`
3. `session`: Maps token data to session object (see `types/next-auth.d.ts` for extended session type)

Middleware (`src/middleware.ts`) protects routes starting with `/dashboard`.

## Critical Conventions

### Environment Variables

**Always** use `@t3-oss/env-nextjs` (`src/env.ts`) - never `process.env` directly:

```typescript
import { env } from "@/env";
const apiKey = env.ALCHEMY_API_KEY; // ✅ Type-safe with Zod validation
```

### TypeScript Patterns

- **Types location**: `src/constants/types/api/{service}/{functionName}Types.ts`
- **Enums**: `src/constants/enum/{name}.ts` (e.g., `AlchemyNetwork`)
- **Path alias**: Use `@/*` for all imports (`@/components/ui/button`)

### Server vs Client Components

- **Services**: Always `"use server"` at top of file
- **API routes**: No directive needed (server by default)
- **Components**: `"use client"` if using hooks (useState, useSession, etc.)
- **Providers**: Must be `"use client"` (see `src/providers/`)

### API Route Pattern

```typescript
// src/app/api/[service]/route.ts
export async function POST(request: Request): Promise<Response> {
  const body: ParamsType = await request.json();

  // Validate required fields
  if (!body.required) {
    return Response.json({ error: "Message" }, { status: 400 });
  }

  const data = await serviceFunction(body);
  return data
    ? Response.json(data, { status: 200 })
    : Response.json({ error: "Failed" }, { status: 500 });
}
```

### Alchemy Multi-Chain Handling

Networks defined in `AlchemyNetwork` enum. Portfolio/transaction services accept arrays of `{address, networks[]}` for cross-chain queries. See `src/services/alchemy/getPortfolio.ts` for filtering zero-balance tokens.

## Development Workflow

### Package Management with Bun

**Always use Bun** for package management:

```bash
bun install              # Install dependencies
bun add <package>        # Add a new package
bun add -d <package>     # Add dev dependency
bun remove <package>     # Remove a package
bun run <script>         # Run package.json script
```

### Local Development

```bash
bun run dev    # Uses --turbopack flag (see package.json)
bun run build  # Production build with Turbopack
bun run start  # Start production server
bun run lint   # Run ESLint
```

**Note**: All builds use Turbopack for faster performance

### Type Safety

- Session types extended in `types/next-auth.d.ts` (adds `_id`, `first_name`, `last_name`)
- All API responses have typed interfaces in `src/constants/types/`
- Use Zod schemas in `src/env.ts` for runtime validation

### UI Components with shadcn/ui

This project uses **shadcn/ui** - a collection of re-usable components built with Radix UI and Tailwind CSS. Configuration is in `components.json`.

**Key Points**:

- Components are located in `src/components/ui/`
- Style: `new-york` variant
- Uses React Server Components (`rsc: true`)
- Path aliases configured: `@/components`, `@/lib/utils`, `@/hooks`
- Icon library: `lucide-react`

**Adding New Components**:

```bash
bunx shadcn@latest add <component-name>  # Add a single component
bunx shadcn@latest add button dialog     # Add multiple components
```

**Before Creating Custom Components**:

1. Check if shadcn/ui has the component: https://ui.shadcn.com/docs/components
2. Check `src/components/ui/` for existing components
3. Use existing primitives when possible

**Common Patterns**:

- Sidebar: `SidebarProvider > AppSidebar + SidebarInset` (see `src/app/layout.tsx`)
- Forms: Use shadcn/ui form components with react-hook-form
- Dialogs/Modals: Use `Dialog` component from `@/components/ui/dialog`
- Dropdowns: Use `DropdownMenu` from `@/components/ui/dropdown-menu`

### Theme Support

`ThemeProvider` from `next-themes` wraps app. Use `suppressHydrationWarning` on `<html>` tag to prevent mismatches.

## Common Patterns

### Fetching from Backend

```typescript
// In service (src/services/)
"use server";
import { env } from "@/env";

const response = await fetch(`${env.BACKEND_URL}/endpoint`, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
});
```

### Client-Side API Calls

```typescript
// In component
const response = await fetch(`${env.NEXT_PUBLIC_FRONTEND_URL}/api/...`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(params),
});
```

### Server-side API Calls

```typescript
// page.tsx or server component
const response = fetch(`${env.NEXT_PUBLIC_FRONTEND_URL}/api/...`, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
});

<Component dataPromise={response} />;

// In component
import { use } from "react";

function Component({ dataPromise }: { dataPromise: Promise<Response> }) {
  const message = use(dataPromise);
}
```

### Session Access

```typescript
// Server component
import { auth } from "@/auth";
const session = await auth();

// Client component
import { useSession } from "next-auth/react";
const { data: session } = useSession();
```

## Documentation

External API specs in `docs/` (e.g., `api-spec-token-list.md`). Reference these when implementing new integrations for backend api calls and for coingecko/alchemy services is found in `https://docs.coingecko.com/v3.0.1/reference` and `https://www.alchemy.com/docs`.
