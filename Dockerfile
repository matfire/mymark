# Stage 1: Base image with pnpm
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate
WORKDIR /app

# Stage 2: Install all dependencies
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/orpc/package.json ./packages/orpc/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile

# Stage 3: Build the API
FROM deps AS build
COPY . .
RUN pnpm turbo build --filter=@mymark/api

# Stage 4: Production image
FROM base AS production
ENV NODE_ENV=production

# Copy node_modules from build stage (pnpm store structure)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules

# Copy built API (tsdown bundles workspace packages)
COPY --from=build /app/apps/api/dist ./apps/api/dist

CMD ["node", "apps/api/dist/index.mjs"]
