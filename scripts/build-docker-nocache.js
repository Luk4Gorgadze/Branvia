#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const steps = [
    {
        name: 'base',
        args: ['build', '--no-cache', '-f', 'docker/Dockerfile.base', '-t', 'base', '.'],
    },
    {
        name: 'web',
        args: ['build', '--no-cache', '-f', 'docker/Dockerfile.web', '-t', 'branvia_web', '.'],
    },
    {
        name: 'worker',
        args: ['build', '--no-cache', '-f', 'docker/Dockerfile.worker', '-t', 'branvia_worker', '.'],
    },
];

for (const step of steps) {
    console.log(`\n=== Building ${step.name} image (no cache) ===`);
    const child = spawnSync('docker', step.args, { stdio: 'inherit', shell: true });
    if (child.status !== 0) {
        console.error(`\nBuild failed at step: ${step.name}`);
        process.exit(child.status ?? 1);
    }
}

console.log('\nAll images built without cache.');

