# Production Dockerfile for BullMQ Worker
FROM branvia-base

# Copy workspace configuration
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./

# Copy worker and database packages
COPY worker/package.json ./worker/
COPY worker/ ./worker/
COPY packages/database/ ./packages/database/
# Copy .env file from root
COPY .env ./

# Install all dependencies (including devDependencies for build)
WORKDIR /app
RUN pnpm install

# Build the worker
WORKDIR /app/worker
RUN pnpm run build

# Remove devDependencies for production
RUN pnpm prune --prod

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S worker -u 1001

# Change ownership of the app directory
RUN chown -R worker:nodejs /app
USER worker

# Start the worker
CMD ["pnpm", "start"] 