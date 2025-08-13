#!/bin/bash

set -e

echo "🚀 Starting deployment..."

pnpm copy-env

# Check types before building (catch errors early)
echo "🔍 Checking TypeScript types..."
pnpm --filter branvia-app check-types
pnpm --filter branvia-worker check-types

# Build database package first (generates Prisma client)
# echo "📦 Building database package..."
# pnpm build:db

# Build base image
echo "🐳 Building base Docker image..."
docker build -f docker/Dockerfile.base -t branvia-base:latest .

# Build web app
echo "🌐 Building web Docker image..."
docker build -f docker/Dockerfile.web -t branvia-web:latest .

# Build worker
echo "⚙️ Building worker Docker image..."
docker build -f docker/Dockerfile.worker -t branvia-worker:latest .

# Start everything
echo "🚀 Starting services..."
pnpm docker:prod