# MyMark

A collaborative markdown note-taking application with real-time synchronization across devices. Built with modern web technologies and conflict-free data structures (CRDTs) for seamless collaborative editing.

## Features

- **Real-time Sync** - Documents sync instantly across all your devices using Automerge CRDTs
- **Workspace Organization** - Hierarchical file and folder structure for organizing notes
- **Markdown Editor** - Full-featured markdown editing powered by CodeMirror
- **Multiple Auth Methods** - Sign in with GitHub OAuth or passwordless Passkeys (WebAuthn)
- **Offline Support** - Works offline with IndexedDB storage, syncs when back online (if logged in)
- **Document Export** - Export your workspace as a ZIP file

## Tech Stack

**Frontend:** Solid.js, TanStack Router, Tailwind CSS, DaisyUI, CodeMirror

**Backend:** Hono, Node.js, ORPC

**Database:** PostgreSQL, Drizzle ORM

**Sync:** Automerge (CRDT), WebSocket

**Auth:** better-auth, Passkey/WebAuthn

**Build:** Vite, Turborepo, pnpm

## Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL (or Docker)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vivamark.git
cd vivamark

# Install dependencies
pnpm install

# Start PostgreSQL with Docker
docker compose up -d

# Push database schema
pnpm db:push

# Generate auth schemas
pnpm ba:generate
```

## Configuration

### Database (`packages/db/.env`)

```env
DATABASE_URL=postgresql://vivamark:vivamark@localhost:5432/vivamark
```

### API (`apps/api/.env`)

```env
DATABASE_URL=postgresql://vivamark:vivamark@localhost:5432/vivamark

# Authentication
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:5173
APP_URL=http://localhost:5173

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# WebAuthn
RP_ID=localhost
```

### Web (`apps/web/.env`)

```env
VITE_API_URL=http://localhost:3000
```

## Development

```bash
# Start all services in development mode
pnpm dev
```

This starts:
- Frontend at `http://localhost:5173`
- API server at `http://localhost:3000`
- WebSocket endpoint at `ws://localhost:3000/automerge`

### Other Commands

```bash
pnpm build       # Build all packages
pnpm lint        # Run linter
pnpm lint:fix    # Fix linting issues
pnpm db:push     # Push database schema changes
```

## Project Structure

```
vivamark/
├── apps/
│   ├── api/          # Backend API server (Hono + WebSocket)
│   ├── web/          # Frontend application (Solid.js)
│   └── landing/      # Landing page
├── packages/
│   ├── common/       # Shared types and utilities
│   ├── db/           # Database schemas (Drizzle ORM)
│   ├── orpc/         # RPC contracts
│   └── config/       # Shared configuration
├── compose.yaml      # Docker Compose for development
└── compose.prod.yaml # Docker Compose for production
```

## Production Deployment

Build and run with Docker:

```bash
# Build the production image
docker build -t mymark .

# Run with Docker Compose
docker compose -f compose.prod.yaml up -d
```

## License

MIT © 2026 Matteo Gassend
