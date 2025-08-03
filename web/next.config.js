import { config } from 'dotenv';
import path from 'path';

// Load environment variables from root .env file
config({ path: path.resolve(process.cwd(), '../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['images.unsplash.com'],
    },
};

export default nextConfig;
