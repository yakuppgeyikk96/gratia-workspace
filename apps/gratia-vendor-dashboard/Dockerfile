# Use official Node.js LTS image
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.20.0

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/gratia-vendor-dashboard/package.json ./apps/gratia-vendor-dashboard/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/gratia-vendor-dashboard ./apps/gratia-vendor-dashboard
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config

# Build the application
WORKDIR /app/apps/gratia-vendor-dashboard
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy standalone output
COPY --from=base /app/apps/gratia-vendor-dashboard/.next/standalone ./
COPY --from=base /app/apps/gratia-vendor-dashboard/.next/static ./apps/gratia-vendor-dashboard/.next/static
COPY --from=base /app/apps/gratia-vendor-dashboard/public ./apps/gratia-vendor-dashboard/public

# Expose port
EXPOSE 3100

# Set environment
ENV NODE_ENV=production
ENV PORT=3100
ENV HOSTNAME=0.0.0.0

# Start the application
CMD ["node", "apps/gratia-vendor-dashboard/server.js"]
