import fs from 'fs';
import path from 'path';

const rootEnvPath = path.join(process.cwd(), '.env');
const webEnvPath = path.join(process.cwd(), 'web', '.env');
const workerEnvPath = path.join(process.cwd(), 'worker', '.env');
const scriptsEnvPath = path.join(process.cwd(), 'scripts', '.env');
const databaseEnvPath = path.join(process.cwd(), 'packages', 'database', '.env');

try {
    // Check if root .env exists
    if (!fs.existsSync(rootEnvPath)) {
        console.error('❌ Root .env file not found!');
        process.exit(1);
    }

    // Copy to web package
    fs.copyFileSync(rootEnvPath, webEnvPath);
    console.log('✅ Copied .env to web/.env');

    // Copy to worker package
    fs.copyFileSync(rootEnvPath, workerEnvPath);
    console.log('✅ Copied .env to worker/.env');

    // Copy to scripts folder
    fs.copyFileSync(rootEnvPath, scriptsEnvPath);
    console.log('✅ Copied .env to scripts/.env');

    // Copy to database package
    fs.copyFileSync(rootEnvPath, databaseEnvPath);
    console.log('✅ Copied .env to packages/database/.env');

    console.log('🎉 Environment files copied successfully!');
} catch (error) {
    console.error('❌ Error copying environment files:', error.message);
    process.exit(1);
} 