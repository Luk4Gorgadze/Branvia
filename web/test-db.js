import { config } from 'dotenv';
import path from 'path';

// Load environment variables from root .env file
config({ path: path.resolve(process.cwd(), '../.env') });

console.log('Environment variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD);
console.log('POSTGRES_DB:', process.env.POSTGRES_DB);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Show what the DATABASE_URL should be
const expandedUrl = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5433/${process.env.POSTGRES_DB}`;
console.log('\nExpanded DATABASE_URL should be:', expandedUrl); 