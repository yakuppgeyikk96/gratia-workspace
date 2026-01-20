# Use official Node.js LTS image
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.20.0

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/gratia-api/package.json ./apps/gratia-api/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/gratia-api ./apps/gratia-api
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config

# Build TypeScript
WORKDIR /app/apps/gratia-api
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN npm install -g pnpm@10.20.0

WORKDIR /app

# Copy workspace files for production install
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/gratia-api/package.json ./apps/gratia-api/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built files from base stage
COPY --from=base /app/apps/gratia-api/dist ./apps/gratia-api/dist

WORKDIR /app/apps/gratia-api

# Expose port
EXPOSE 8080

# Set production environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Start the application
CMD ["node", "dist/app.js"]
