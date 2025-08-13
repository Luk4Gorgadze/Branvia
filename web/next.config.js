import dotenv from 'dotenv';
dotenv.config();

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['images.unsplash.com', 'branvia-images.s3.eu-central-1.amazonaws.com', 'picsum.photos'],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
