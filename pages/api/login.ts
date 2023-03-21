import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { nanoid } from 'nanoid';

const createState = (length: number) => {
  return nanoid(length);
};

type Data = {
  url: string;
};

const handler: NextApiHandler = async (
  _req: NextApiRequest,
  res: NextApiResponse<Data>
) => {
  const state = createState(64);
  const scopes = ['user-top-read', 'user-read-private', 'user-read-email'];
  const url = new URL('https://accounts.spotify.com/authorize');
  url.searchParams.append('client_id', process.env.SPOTIFY_CLIENT_ID);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('redirect_uri', process.env.SPOTIFY_REDIRECT_URL);
  url.searchParams.append('scope', scopes.join(' '));
  url.searchParams.append('state', state);

  res.status(200)
    .setHeader('Set-Cookie', `state=${state}`)
    .json({ url: url.toString() });
};

export default handler;
