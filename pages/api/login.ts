import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { SpotifyClient } from '@/lib/spotify';
import { createState } from '@/lib/state';

type Data = {
  url: string;
};

const handler: NextApiHandler = async (
  _req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  const state = createState(64);
  const scopes = [
    'user-top-read',
    'user-read-private',
    'user-read-email',
    'user-read-currently-playing',
    'user-read-recently-played',
  ];

  const url = SpotifyClient.generateAuthorizeUri(state, scopes, {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    redirectUri: process.env.SPOTIFY_REDIRECT_URL,
  });

  res
    .status(200)
    .setHeader('Set-Cookie', `state=${state}`)
    .json({ url: url.toString() });
};

export default handler;
