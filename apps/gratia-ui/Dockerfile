# Use official Node.js LTS image
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.20.0

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/gratia-ui/package.json ./apps/gratia-ui/
COPY packages/ui/package.json ./packages/ui/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/gratia-ui ./apps/gratia-ui
COPY packages/ui ./packages/ui
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config

# Build the application
WORKDIR /app/apps/gratia-ui
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy standalone output
COPY --from=base /app/apps/gratia-ui/.next/standalone ./
COPY --from=base /app/apps/gratia-ui/.next/static ./apps/gratia-ui/.next/static
COPY --from=base /app/apps/gratia-ui/public ./apps/gratia-ui/public

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Start the application
CMD ["node", "apps/gratia-ui/server.js"]
