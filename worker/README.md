# Branvia Worker Service

BullMQ worker service for handling AI image generation jobs.

## Features

- **Image Generation Queue**: Processes AI image generation requests
- **Job Management**: Handles job status, retries, and error handling
- **Redis Integration**: Uses Redis for job queue management
- **Scalable**: Can run multiple worker instances

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root directory with:
   ```bash
   REDIS_URL=redis://localhost:6379
   ```

3. **Start the worker**:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## Job Types

### Image Generation Job

Processes AI image generation requests with the following data:

```typescript
interface ImageGenerationJobData {
  productImage: string;        // Base64 encoded image
  productTitle: string;        // Product name
  productDescription: string;  // Product description
  selectedStyle: string;       // Visual style preset
  customStyle?: string;        // Custom style description
  outputFormat: string;        // Output format (Instagram, Facebook, etc.)
  userId: string;              // User ID
  campaignId: string;          // Campaign ID
}
```

## API Integration

The worker processes jobs from the queue. Jobs can be added via:

- **Web App API**: `/api/jobs/image-generation` (POST)
- **Direct Queue**: Using `addImageGenerationJob()` function

## Monitoring

- **Job Status**: Check job status via API or queue functions
- **Queue Stats**: Monitor queue performance and job counts
- **Logs**: Worker logs job completion, failures, and errors

## Deployment

The worker can be deployed using Docker:

```bash
docker build -t branvia-worker .
docker run -d --name branvia-worker branvia-worker
```

Or using the main docker-compose:

```bash
docker-compose up worker -d
``` 