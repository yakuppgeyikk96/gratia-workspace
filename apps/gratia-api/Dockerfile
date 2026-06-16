# Base stage: install dependencies and copy source (used by dev override)
FROM node:20-alpine AS base

RUN npm install -g pnpm@10.20.0

WORKDIR /app

# Copy workspace manifest and lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Copy app and shared package manifests
COPY apps/gratia-api/package.json ./apps/gratia-api/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install dependencies for the whole workspace (filtered)
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/gratia-api ./apps/gratia-api
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config

# Build TypeScript
WORKDIR /app/apps/gratia-api
RUN pnpm build

EXPOSE 8080

CMD ["pnpm", "start"]

# Production stage: lean runtime with only built output + prod deps
FROM node:20-alpine AS production

RUN npm install -g pnpm@10.20.0

WORKDIR /app

# Workspace manifests needed for pnpm to resolve workspace layout
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/gratia-api/package.json ./apps/gratia-api/

# Install only production dependencies for the api
RUN pnpm install --frozen-lockfile --prod --filter=gratia-api...

# Copy compiled output from the base stage
COPY --from=base /app/apps/gratia-api/dist ./apps/gratia-api/dist

WORKDIR /app/apps/gratia-api

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080

CMD ["node", "dist/app.js"]
