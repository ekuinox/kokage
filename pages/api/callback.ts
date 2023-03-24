import type { NextApiRequest, NextApiResponse } from 'next';
import { SpotifyClient } from '@/lib/spotify';
import { upsertUser } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { state, code },
  } = req;

  if (typeof state !== 'string' || typeof code !== 'string') {
    res.status(400).send('');
    return;
  }

  const { state: stateFromCookie } = req.cookies;

  if (state !== stateFromCookie) {
    res.status(400).send('state is incorrect');
    return;
  }

  try {
    const spotify = await SpotifyClient.fromCode(code, {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URL,
    });

    const { display_name: name, id } = await spotify.getCurrentUsersProfile();

    const scopes = spotify.getScopes();
    const expiresAt = spotify.getExpiresAt();

    if (scopes == null || expiresAt == null) {
      res.status(500).send('scopes or expiresAt are null');
      return;
    }

    await upsertUser({
      id,
      name,
      tokens: {
        accessToken: spotify.getAccessToken(),
        refreshToken: spotify.getRefreshToken(),
        expiresAt,
        scopes,
      },
    });

    res.redirect(`/user/${id}`);
  } catch (e) {
    console.error({ e });
    res.status(500).send('');
  }
}
