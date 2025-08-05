# Use shared base image with built database package
FROM branvia-base

# Copy web files
COPY web/package.json ./
COPY web/ ./

# Install web dependencies
RUN pnpm install --prod

# Build the web app
RUN pnpm run build

# Start the web app
CMD ["pnpm", "start"] 