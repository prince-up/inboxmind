# InboxMind AI

InboxMind AI is a production-oriented Chrome extension foundation for an AI
email copilot embedded in Gmail. The extension uses Plasmo, React, strict
TypeScript, Tailwind CSS, Zustand, and TanStack Query on Manifest V3.

This commit establishes architecture and tooling only. Product features are
introduced incrementally in later commits.

## Requirements

- Node.js 20.11 or newer
- pnpm 9.15.1
- Google Chrome with Manifest V3 support

## Commands

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm validate
```

The development extension is generated at `build/chrome-mv3-dev`. The
production extension is generated at `build/chrome-mv3-prod`.

## Architecture

All runtime source code lives under `src/`.

```text
src/
├── background/    Manifest V3 service-worker entry points
├── components/    Shared React components and providers
├── config/        Validated environment and runtime configuration
├── constants/     Routes, selectors, and versioned storage keys
├── contents/      Plasmo content-script entry points
├── features/      Self-contained product feature modules
│   ├── ai/
│   ├── gmail/
│   ├── notification/
│   ├── parser/
│   ├── reminder/
│   └── sidebar/
├── hooks/         Reusable React hooks
├── lib/           Configured third-party infrastructure
├── services/      External-system and browser API boundaries
├── store/         Zustand store factories and shared state
├── styles/        Tailwind layers and global styles
├── types/         Provider-neutral domain contracts
└── utils/         Focused browser, DOM, logging, and storage helpers
```

Feature modules own their UI, hooks, services, state, and domain behavior.
Cross-feature primitives belong in the corresponding top-level shared folder.
Dependencies flow from features toward shared contracts and infrastructure;
shared modules never import feature implementations.

## Import conventions

The `@/*` alias resolves to `src/*`. Absolute imports are required when crossing
module boundaries. Relative imports remain appropriate within a tightly
coupled folder.

```ts
import type { Email } from '@/types';
```

## Environment configuration

Plasmo exposes public build-time values with the `PLASMO_PUBLIC_` prefix. Copy
`.env.example` to a local Plasmo environment file when overriding defaults.
Environment values are validated before use.

| Variable                  | Allowed values                             | Default |
| ------------------------- | ------------------------------------------ | ------- |
| `PLASMO_PUBLIC_LOG_LEVEL` | `debug`, `info`, `warn`, `error`, `silent` | `info`  |

Never expose secrets through `PLASMO_PUBLIC_` variables. Secrets must remain
behind a trusted server boundary.

## Quality gates

`pnpm validate` runs strict TypeScript checks, ESLint, Prettier verification,
and a production Plasmo build. Every commit must pass these gates before the
next product layer is introduced.
