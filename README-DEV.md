This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## Getting Started

First, run the development server:
```
docker build -f Dockerfile.base -t branvia-base:latest .
```

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Inter, a custom Google Font.

## Type Checking & Auto-Fixing

This project includes several tools to catch and fix issues early in development:

### TypeScript Type Checking

Check for type errors without building:
```bash
# Check web package types
pnpm --filter branvia-app check-types

# Check worker package types
pnpm --filter branvia-worker check-types

# Check database package types
pnpm --filter @branvia/database check-types

# Check all packages at once
pnpm check-types
```

### ESLint Auto-Fixing

Automatically fix many code issues:
```bash
# Fix web package linting issues
pnpm --filter branvia-app lint --fix

# Fix worker package linting issues
pnpm --filter branvia-worker lint --fix

# Fix all packages
pnpm lint --fix
```

### Next.js 15+ API Route Auto-Fix

For Next.js 15+ API routes with dynamic parameters, the project includes an auto-fix script:

```bash
# Automatically fix API route type signatures
node scripts/fix-api-routes.js
```

This script:
- Finds all `route.ts` files in the web app
- Updates `{ params }` to `context` parameter
- Changes `params.id` to `context.params.id`
- Handles the new async `params` Promise pattern

### Pre-Build Validation

The deployment script automatically runs type checks before building Docker images:
```bash
./scripts/deploy-prod.sh
```

This ensures:
- TypeScript compilation errors are caught early
- No time is wasted on Docker builds with type errors
- Faster feedback loop for developers

### Common Type Issues & Fixes

**Next.js 15+ API Routes:**
```typescript
// ❌ Old pattern (Next.js 14)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const id = params.id;
}

// ✅ New pattern (Next.js 15+)
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    const id = params.id;
}
```

**Workspace Dependencies:**
- Use `workspace:*` in package.json for monorepo dependencies
- Ensure packages are built before Docker builds
- Run type checks from the root directory

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
