import { spawn } from 'node:child_process';

const command = process.platform === 'win32'
  ? 'taskkill /F /IM node.exe'
  : 'pkill -f "vite|tsx watch src/server.ts"';

spawn(command, {
  stdio: 'inherit',
  shell: true,
});
