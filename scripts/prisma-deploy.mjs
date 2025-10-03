#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';
const command = isWindows ? 'npx.cmd' : 'npx';

const result = spawnSync(command, ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  shell: false,
});

if (result.error) {
  console.error('Failed to execute Prisma migrate deploy:', result.error);
  process.exit(1);
}

if (typeof result.status !== 'number' || result.status !== 0) {
  console.error('Prisma migration deployment failed. Check the logs above for details.');
  process.exit(result.status ?? 1);
}

console.log('Prisma migrations were successfully applied.');
