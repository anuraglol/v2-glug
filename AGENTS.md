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
bun run check        # Run lint + fmt:check
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
bun run dev:server   # Start Wrangler dev (from root)
bun run build:server # Deploy to Cloudflare (from root)
# Or from server directory:
bun dev              # Start Wrangler dev server
bun deploy           # Deploy to Cloudflare
bun cf-typegen       # Generate Cloudflare types
```

### Testing
No test framework configured yet. When added, use Vitest:
```bash
bun test path/to/file.test.ts   # Run single test file
bun test --grep "test name"     # Run tests matching pattern
```

## Code Style

### TypeScript
- Strict mode enabled in both client and server
- Use explicit types for function parameters and return values
- Prefer `type` over `interface` for object shapes
- Use `React.ComponentProps<"element">` for component prop types

### Imports
Order: React → external packages → internal aliases (`@/...`)
```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

Path alias: `@/*` → `./client/*` (client only)

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
- Add `data-slot="component-name"` for identification
- Spread `...props` last on root element
- Use `cn()` for class name merging

### Naming Conventions
- **Components**: PascalCase (`Button`, `AlertDialog`)
- **Files**: kebab-case (`alert-dialog.tsx`)
- **Functions/variables**: camelCase (`buttonVariants`)
- **CSS variables**: kebab-case (`--font-sans`)

### Exports
- Use named exports (not default exports) for components
- Export variant definitions when using CVA
```tsx
export { Button, buttonVariants }
```

### Styling (Tailwind CSS v4)
- Use Tailwind utility classes exclusively
- Use `cn()` helper for conditional classes
- Use `cva()` for variant-based styling
- Colors use OKLCH color space

### UI Components (shadcn/ui)
- Components in `client/components/ui/`
- Add new: `bunx shadcn@latest add <component>`
- Icons: `lucide-react`

### Server Code (Hono)
```typescript
import { Hono } from "hono"
import { cors } from "hono/cors"

const app = new Hono()

app.get("/endpoint", (c) => {
  return c.json({ data: "value" })
})

export default app
```
- Use ES modules
- Hono JSX configured (`jsxImportSource: "hono/jsx"`)

### Error Handling
- Use try-catch for async operations
- Return appropriate HTTP status codes
- Log errors with `console.error()` before returning error responses

## File Structure

```
client/
├── app/              # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/           # shadcn/ui components
│   └── *.tsx
├── lib/utils.ts      # cn() helper
└── hooks/

server/
└── src/
    ├── index.ts      # App entry point
    ├── routes/       # Route handlers
    ├── middleware/   # Auth, CSRF, etc.
    └── lib/          # Utilities, DB
```

## Linting & Formatting

- **oxlint**: Linter for all packages (`bun run lint`)
- **oxfmt**: Formatter (`bun run fmt`)
- **ESLint**: Client-only (`eslint-config-next`)

Run `bun run check` before committing.

## Key Dependencies

**Client**: next (16.x), react (19.x), radix-ui, class-variance-authority, tailwind-merge, lucide-react, @tanstack/react-query, zustand

**Server**: hono (4.x), drizzle-orm, @neondatabase/serverless, jose, wrangler

## Git Commits

Use conventional commits: `type(scope): message`
Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`
