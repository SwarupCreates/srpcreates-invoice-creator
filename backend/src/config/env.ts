import 'dotenv/config';

export function getEnv() {
  return {
    PORT: Number(process.env.PORT ?? 5000),
    FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ?? '',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ?? '',
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL ?? 'http://localhost:5000/api/auth/github/callback',
  };
}
