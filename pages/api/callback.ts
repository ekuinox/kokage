import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

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

  const url = new URL('https://accounts.spotify.com/api/token');
  url.searchParams.append('grant_type', 'authorization_code');
  url.searchParams.append('code', code);
  url.searchParams.append('redirect_uri', process.env.SPOTIFY_REDIRECT_URL);

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
          'utf-8'
        ).toString('base64')}`,
      },
    });
    const { access_token: accessToken, refresh_token: refreshToken } =
      await response.json();

    console.log({ accessToken, refreshToken });

    const response2 = await fetch('https://api.spotify.com/v1/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { display_name: name, id: id } = await response2.json();

    console.log({ name, id });

    const client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const resp = await client.from('users').upsert({
      id,
      name,
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    console.log({ resp });

    res.status(200).send('OK');
  } catch (e) {
    console.error({ e });
    res.status(500).send('');
  }
}
