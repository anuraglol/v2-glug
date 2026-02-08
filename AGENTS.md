# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

Monorepo with two applications:
- **client/** - Next.js 16 frontend (React 19, Tailwind CSS v4, shadcn/ui)
- **server/** - Hono framework backend on Cloudflare Workers

Package manager: **Bun** (use `bun` instead of `npm`)

## Commands

### Root (Monorepo)
```bash
bun install          # Install all dependencies (run from root)
bun run lint         # Run oxlint on all packages
bun run fmt          # Format code with oxfmt
bun run fmt:check    # Check formatting
bun run check        # Run lint + fmt:check (run before committing)
```

### Client
```bash
bun run dev:client   # Start dev server (from root)
bun run build:client # Production build (from root)
# Or from client directory:
bun dev              # http://localhost:3000
bun build && bun start
```

### Server
```bash
bun run dev:server   # Start Wrangler dev on port 3001 (from root)
bun run build:server # Deploy to Cloudflare (from root)
# Or from server directory:
bun dev              # Start Wrangler dev server
bun deploy           # Deploy to Cloudflare
bun cf-typegen       # Generate Cloudflare types
```

### Testing
No test framework configured yet. When added, use Vitest:
```bash
bun test                        # Run all tests
bun test path/to/file.test.ts   # Run single test file
bun test --grep "test name"     # Run tests matching pattern
```

## Code Style

### Formatting (oxfmt)
- 2-space indentation
- No semicolons
- Double quotes for strings
- Line width: 100 characters

### TypeScript
- Strict mode enabled in both client and server
- Use explicit types for function parameters and return values
- Prefer `type` over `interface` for object shapes
- Use Drizzle's `$inferSelect`/`$inferInsert` for DB types

### Imports
Order: React/framework → external packages → internal aliases (`@/...`)
```typescript
import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

Path alias: `@/*` maps to `./client/*` (client only)

### React Components
Use function declarations (not arrow functions):
```tsx
function Button({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "default" | "secondary"
}) {
  return (
    <button
      data-slot="button"
      data-variant={variant}
      className={cn(baseClasses, className)}
      {...props}
    />
  )
}

export { Button }
```

Conventions:
- Use `"use client"` directive for interactive components
- Add `data-slot="component-name"` for component identification
- Spread `...props` last on root element
- Use `cn()` for class name merging

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Button`, `AlertDialog` |
| Files | kebab-case | `alert-dialog.tsx` |
| Functions/variables | camelCase | `buttonVariants`, `useQuiz` |
| CSS variables | kebab-case | `--font-sans` |
| DB columns | snake_case | `created_at`, `user_id` |

### Exports
- Use named exports (not default exports) for components
- Exception: Route handlers export default (Hono convention)
```tsx
export { Button, buttonVariants }
```

### Custom Hooks
Create hooks in `client/lib/hooks/` using React Query:
```typescript
export function useQuiz() {
  const { data, isLoading } = useQuery({
    queryKey: ["quiz-questions"],
    queryFn: async () => {
      const { data } = await apiClient.get("/quiz/questions")
      return data.questions as Question[]
    },
  })
  return { questions: data, isLoading }
}
```

### Server Code (Hono)
```typescript
import { Hono } from "hono"
import { HonoParams } from "./lib/types"

const app = new Hono<HonoParams>()

app.get("/endpoint", (c) => {
  return c.json({ data: "value" })
})

export default app
```
- Use ES modules
- Type Hono apps with `HonoParams` for bindings/variables
- Access DB via `c.get("db")`, user via `c.get("user")`

### Error Handling
- Use try-catch for async operations
- Return appropriate HTTP status codes with `c.json({ error: "message" }, statusCode)`
- Log errors with `console.error()` before returning error responses

## File Structure

```
client/
├── app/              # Next.js App Router pages
├── components/ui/    # shadcn/ui components
├── lib/
│   ├── hooks/        # React Query hooks
│   ├── utils.ts      # cn() helper, CSRF utils
│   └── query.ts      # API client, QueryClient

server/src/
├── index.ts          # App entry, middleware, routes
├── routes/           # Route handlers (auth, quiz, admin)
├── middleware/       # Auth, CSRF, DB middleware
└── lib/
    ├── db/           # Drizzle schema, DB connection
    ├── types.ts      # HonoParams, EnvBindings
    └── *.ts          # JWT, tokens, auth utils
```

## UI Components

- Components in `client/components/ui/` (shadcn/ui)
- Add new: `bunx shadcn@latest add <component>`
- Icons: `lucide-react`
- Use `cva()` for variant-based styling
- Colors use OKLCH color space (Tailwind v4)

## Key Dependencies

**Client**: next (16.x), react (19.x), @tanstack/react-query, zustand, radix-ui, class-variance-authority, tailwind-merge, lucide-react, axios

**Server**: hono (4.x), drizzle-orm, @neondatabase/serverless, jose, wrangler

## Git Commits

Use conventional commits: `type(scope): message`
Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`
