import { config } from 'dotenv';
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['images.unsplash.com', 'branvia-images.s3.eu-central-1.amazonaws.com', 'picsum.photos'],
    },
};

export default nextConfig;
