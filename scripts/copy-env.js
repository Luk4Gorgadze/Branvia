import fs from 'fs';
import path from 'path';

const webEnvPath = path.join(process.cwd(), 'web', '.env');
const workerEnvPath = path.join(process.cwd(), 'worker', '.env');
const scriptsEnvPath = path.join(process.cwd(), 'scripts', '.env');
const databaseEnvPath = path.join(process.cwd(), 'packages', 'database', '.env');

// Get environment argument from command line
const envArg = process.argv[2];
const rootEnvPath = path.join(process.cwd(), '.env');
const rootEnvDevPath = path.join(process.cwd(), '.env.dev');
const rootEnvProdPath = path.join(process.cwd(), '.env.prod');
const rootEnvStagingPath = path.join(process.cwd(), '.env.staging');

try {
    // Determine which source file to use based on argument
    let sourceEnvPath;
    let envName;

    switch (envArg) {
        case 'dev':
        case 'development':
            if (fs.existsSync(rootEnvDevPath)) {
                sourceEnvPath = rootEnvDevPath;
                envName = 'development';
            } else {
                throw new Error('.env.dev not found');
            }
            break;

        case 'prod':
        case 'production':
            if (fs.existsSync(rootEnvProdPath)) {
                sourceEnvPath = rootEnvProdPath;
                envName = 'production';
            } else {
                throw new Error('.env.prod not found');
            }
            break;

        case 'staging':
            if (fs.existsSync(rootEnvStagingPath)) {
                sourceEnvPath = rootEnvStagingPath;
                envName = 'staging';
            } else {
                throw new Error('.env.staging not found');
            }
            break;

        default:
            // Fallback to .env if no argument or invalid argument
            if (fs.existsSync(rootEnvPath)) {
                sourceEnvPath = rootEnvPath;
                envName = 'default';
            } else {
                throw new Error('No environment file found. Available options: dev, prod, staging, or .env');
            }
    }

    console.log(`📁 Using ${envName} environment file: ${path.basename(sourceEnvPath)}`);

    // Copy to web package
    fs.copyFileSync(sourceEnvPath, webEnvPath);
    console.log('✅ Copied to web/.env');

    // Copy to worker package
    fs.copyFileSync(sourceEnvPath, workerEnvPath);
    console.log('✅ Copied to worker/.env');

    // Copy to scripts folder
    fs.copyFileSync(sourceEnvPath, scriptsEnvPath);
    console.log('✅ Copied to scripts/.env');

    // Copy to database package
    fs.copyFileSync(sourceEnvPath, databaseEnvPath);
    console.log('✅ Copied to packages/database/.env');

    console.log('🎉 Environment files copied successfully!');
} catch (error) {
    console.error('❌ Error copying environment files:', error.message);
    console.log('\nUsage: node scripts/copy-env.js [env]');
    console.log('Available environments: dev, prod, staging');
    console.log('Example: node scripts/copy-env.js dev');
    process.exit(1);
}