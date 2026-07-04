import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const frontendDir = path.join(root, 'react-app');
const backendDir = path.join(root, 'backend');

const frontend = spawn('npm', ['run', 'dev', '--', '--host', '0.0.0.0', '--port', '5173'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true,
});

const backend = spawn('npm', ['run', 'dev'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
});

const shutdown = () => {
  frontend.kill('SIGTERM');
  backend.kill('SIGTERM');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

frontend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    backend.kill('SIGTERM');
    process.exit(code ?? 1);
  }
});

backend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    frontend.kill('SIGTERM');
    process.exit(code ?? 1);
  }
});
