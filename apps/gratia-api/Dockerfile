# Use official Node.js LTS image
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.27.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN pnpm install --prod=false

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN npm install -g pnpm@10.27.0

WORKDIR /app

# Copy package files
COPY package.json ./

# Install only production dependencies
RUN pnpm install --prod

# Copy built files from base stage
COPY --from=base /app/dist ./dist

# Expose port (Cloud Run will set PORT env variable)
EXPOSE 8080

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Start the application
CMD ["node", "dist/app.js"]