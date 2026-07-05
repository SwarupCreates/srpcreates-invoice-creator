import { Router } from 'express';
import { getEnv } from '../config/env.js';

const router = Router();
const env = getEnv();

router.get('/github/login', (_req, res) => {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.GITHUB_CALLBACK_URL,
    scope: 'read:user user:email',
    allow_signup: 'true',
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

router.get('/github/callback', async (req, res) => {
  const code = req.query.code;

  if (typeof code !== 'string' || !code) {
    res.status(400).json({ error: 'Missing GitHub code' });
    return;
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: env.GITHUB_CALLBACK_URL,
      }),
    });

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
    };

    if (!tokenData.access_token) {
      res.status(400).json({ error: 'GitHub token exchange failed' });
      return;
    }

    const profileResponse = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profileData = (await profileResponse.json()) as {
      login?: string
      avatar_url?: string
    };
    const login = typeof profileData.login === 'string' ? profileData.login : '';
    const avatarUrl = typeof profileData.avatar_url === 'string' ? profileData.avatar_url : '';

    if (!login || !avatarUrl) {
      res.status(500).json({ error: 'GitHub profile lookup failed' });
      return;
    }

    res.cookie('github_access_token', tokenData.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    const params = new URLSearchParams({
      login,
      avatar: avatarUrl,
    });

    res.redirect(`${env.FRONTEND_URL}/?${params.toString()}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'GitHub OAuth failed' });
  }
});

export default router;
