---
---

# Service and API Route Generation Guide

This guide provides step-by-step instructions for creating new services and API routes following the project's three-layer architecture pattern.

## Table of Contents

1. [Overview](#overview)
2. [Step 1: Define Types](#step-1-define-types)
3. [Step 2: Create Service](#step-2-create-service)
4. [Step 3: Create API Route](#step-3-create-api-route)
5. [Quick Reference Checklist](#quick-reference-checklist)

## Overview

The project follows a **three-layer pattern**:

1. **Types** (`src/constants/types/api/`) - Type definitions for requests/responses
2. **Services** (`src/services/`) - Server-side business logic with external API calls
3. **API Routes** (`src/app/api/`) - HTTP endpoints that validate input and call services

## Step 1: Define Types

**Location**: `src/constants/types/api/{service}/{functionName}Types.ts`

### Pattern

```typescript
// Example: src/constants/types/api/getUserTypes.ts

// Request parameters interface
export interface GetUserParams {
  id: string;
  // Add all required parameters
}

// Nested types (if needed)
export interface UserWallet {
  _id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Response interface
export interface GetUserResponse {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  wallets?: UserWallet[]; // Optional fields use ?
}
```

### Naming Conventions

- **Params interface**: `{FunctionName}Params`
- **Response interface**: `{FunctionName}Response`
- **File name**: `{functionName}Types.ts` (camelCase)
- **Nested types**: Descriptive names (e.g., `UserWallet`, `TokenBalance`)

### Type Guidelines

- Use `string` for IDs and dates (they come from API as strings)
- Use `?` for optional fields
- Create separate interfaces for nested objects
- Match backend API response structure exactly

## Step 2: Create Service

**Location**: `src/services/{serviceName}/{functionName}.ts` or `src/services/{functionName}.ts`

### Pattern

```typescript
// Example: src/services/getUser.ts

"use server"; // Always add this directive at the top

import {
  GetUserParams,
  GetUserResponse,
} from "@/constants/types/api/getUserTypes";
import { env } from "@/env";

export async function getUser(
  data: GetUserParams
): Promise<GetUserResponse | undefined> {
  try {
    // 1. Get environment variables using @/env (NEVER use process.env directly)
    const backendUrl = env.BACKEND_URL;

    // 2. Make API call
    const response = await fetch(`${backendUrl}/users/${data.id}`, {
      method: "GET", // or POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
        // Add authentication headers if needed
        // "Authorization": `Bearer ${apiKey}`,
      },
      // For POST/PUT requests, add body:
      // body: JSON.stringify(data),
    });

    // 3. Handle successful response
    if (response.ok) {
      const responseData = (await response.json()) as GetUserResponse;
      return responseData;
    } else {
      // 4. Log errors for debugging
      console.error(
        `Get user failed with status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return undefined;
    }
  } catch (error) {
    // 5. Handle network/fetch errors
    console.error("Get user fetch failed:", error);
    return undefined;
  }
}
```

### Service Checklist

- [ ] Add `"use server"` directive at the top
- [ ] Import types from `@/constants/types/api/`
- [ ] Import `env` from `@/env` for environment variables
- [ ] Use descriptive function name (verb + noun, e.g., `getUser`, `createWallet`)
- [ ] Accept typed parameters (`FunctionNameParams`)
- [ ] Return typed promise (`Promise<FunctionNameResponse | undefined>`)
- [ ] Wrap in try-catch block
- [ ] Use `env.VARIABLE_NAME` for all environment variables
- [ ] Include comprehensive error logging
- [ ] Return `undefined` on failure

### Common Environment Variables

- `env.BACKEND_URL` - Backend API base URL
- `env.ALCHEMY_DATA_URL` - Alchemy API endpoint
- `env.ALCHEMY_API_KEY` - Alchemy API key
- `env.COINGECKO_API_URL` - CoinGecko API endpoint
- `env.COINGECKO_API_KEY` - CoinGecko API key

## Step 3: Create API Route

**Location**: `src/app/api/{resource}/route.ts` or `src/app/api/{resource}/{dynamic}/route.ts`

### Pattern for GET Request

```typescript
// Example: src/app/api/users/route.ts

import { auth } from "@/auth";
import { getUser } from "@/services/getUser";

// Optional: Helper function for reusability
function fetchUserData(userId: string) {
  return getUser({ id: userId });
}

export async function GET(): Promise<Response> {
  try {
    // 1. Get session (if authentication required)
    const session = await auth();
    if (!session?.user?._id) {
      return Response.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    // 2. Call service layer
    const userData = await fetchUserData(session.user._id);

    // 3. Handle service response
    if (!userData) {
      return Response.json({ error: "User data not found" }, { status: 404 });
    }

    // 4. Return successful response
    return Response.json(userData, { status: 200 });
  } catch (error) {
    // 5. Handle errors
    console.error("Error in GET /api/users:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Pattern for POST Request

```typescript
// Example: src/app/api/wallets/route.ts

import { auth } from "@/auth";
import { createWallet } from "@/services/createWallet";
import { CreateWalletParams } from "@/constants/types/api/createWalletTypes";

export async function POST(request: Request): Promise<Response> {
  try {
    // 1. Parse request body
    const body: CreateWalletParams = await request.json();

    // 2. Validate required fields
    if (!body.name || !body.userId) {
      return Response.json(
        { error: "Missing required fields: name, userId" },
        { status: 400 }
      );
    }

    // 3. Optional: Verify authentication
    const session = await auth();
    if (!session?.user?._id) {
      return Response.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    // 4. Call service layer
    const walletData = await createWallet(body);

    // 5. Handle service response
    if (!walletData) {
      return Response.json(
        { error: "Failed to create wallet" },
        { status: 500 }
      );
    }

    // 6. Return successful response
    return Response.json(walletData, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/wallets:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Pattern for Dynamic Routes

```typescript
// Example: src/app/api/users/wallets/[id]/route.ts

import { getWallet } from "@/services/getWallet";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    // 1. Extract dynamic parameter (await params in Next.js 15)
    const { id } = await params;

    // 2. Validate parameter
    if (!id) {
      return Response.json({ error: "Wallet ID is required" }, { status: 400 });
    }

    // 3. Call service layer
    const walletData = await getWallet({ id });

    // 4. Handle response
    if (!walletData) {
      return Response.json({ error: "Wallet not found" }, { status: 404 });
    }

    return Response.json(walletData, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/users/wallets/${id}:`, error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Pattern with Zod Validation & RouteContext

```typescript
// Example: src/app/api/coingecko/coins/[id]/chart/route.ts

import { getHistoricalChart } from "@/services/gecko/getHistoricalChart";
import { NextResponse } from "next/server";
import { z } from "zod";

// 1. Define Zod schema for validation
const requestSchema = z.object({
  id: z.string(),
  vs_currency: z.string(),
  days: z.number().min(1),
  interval: z.enum(["daily"]),
  precision: z.string(),
});

export async function GET(
  req: Request,
  // 2. Use RouteContext for typed params
  ctx: RouteContext<"/api/coingecko/coins/[id]/chart">
) {
  try {
    // 3. Extract params and searchParams
    const { id } = await ctx.params;
    const { searchParams } = new URL(req.url);

    // 4. Parse query parameters
    const vs_currency = searchParams.get("vs_currency") || "usd";
    const days = searchParams.get("days") || "30";
    const interval = searchParams.get("interval") || "daily";
    const precision = searchParams.get("precision") || "2";

    // 5. Validate with Zod
    const parsed = requestSchema.safeParse({
      id,
      vs_currency,
      days: Number(days),
      interval,
      precision,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request parameters", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    // 6. Call service
    const res = await getHistoricalChart(parsed.data);

    if (!res) {
      return NextResponse.json(
        { error: "Failed to fetch market data" },
        { status: 500 }
      );
    }

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in GET /api/coingecko/coins/[id]/chart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### API Route Checklist

- [ ] Import `auth` from `@/auth` if authentication needed
- [ ] Import service function from `@/services/`
- [ ] Export async function with HTTP method name (GET, POST, PUT, DELETE)
- [ ] Wrap in try-catch block
- [ ] Validate required parameters/body fields
- [ ] Check authentication if required (`await auth()`)
- [ ] Call service layer with typed parameters
- [ ] Handle service response (success/failure)
- [ ] Return appropriate HTTP status codes
- [ ] Include descriptive error messages
- [ ] Log errors with route context

### HTTP Status Codes

- `200` - OK (successful GET, PUT, PATCH)
- `201` - Created (successful POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (unexpected errors)

## Quick Reference Checklist

### For New Feature Implementation

1. **Create Types** (`src/constants/types/api/{service}/{functionName}Types.ts`)

   - [ ] Define `{FunctionName}Params` interface
   - [ ] Define `{FunctionName}Response` interface
   - [ ] Add nested types if needed

2. **Create Service** (`src/services/{functionName}.ts`)

   - [ ] Add `"use server"` directive
   - [ ] Import types and `env`
   - [ ] Implement typed function
   - [ ] Use `env.VARIABLE_NAME` for config
   - [ ] Add error handling and logging
   - [ ] Return typed response or `undefined`

3. **Create API Route** (`src/app/api/{resource}/route.ts`)
   - [ ] Import service and auth (if needed)
   - [ ] Export HTTP method handler
   - [ ] Validate input
   - [ ] Call service layer
   - [ ] Return typed response with status code
   - [ ] Handle errors gracefully

### Common Patterns

#### Protected Route (Requires Auth)

```typescript
const session = await auth();
if (!session?.user?._id) {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
```

#### Request Body Validation

```typescript
const body: ParamsType = await request.json();
if (!body.requiredField) {
  return Response.json({ error: "Missing requiredField" }, { status: 400 });
}
```

#### Dynamic Route Parameter

```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

#### Service Response Handling

```typescript
const data = await serviceFunction(params);
if (!data) {
  return Response.json({ error: "Not found" }, { status: 404 });
}
return Response.json(data, { status: 200 });
```

## Examples in Codebase

- **GET with Auth**: `src/app/api/users/route.ts` + `src/services/getUser.ts`
- **GET Dynamic Route**: `src/app/api/users/wallets/[id]/route.ts` + `src/services/getWallet.ts`
- **External API**: `src/services/gecko/getMarket.ts` (CoinGecko integration)
- **Multi-chain Service**: `src/services/alchemy/getBalances.ts` (Alchemy integration)

## Additional Notes

### Using Bun Package Manager

Always use `bun` commands:

```bash
bun install              # Install dependencies
bun add <package>        # Add package
bun run dev              # Start dev server
```

### Path Aliases

Always use `@/` prefix for imports:

```typescript
import { env } from "@/env";
import { getUser } from "@/services/getUser";
import { Button } from "@/components/ui/button";
```

### Next.js 15 Changes

- Dynamic route params are now async: `await params`
- No need for `"use client"` or `"use server"` in API routes (server by default)
- Services must have `"use server"` directive
