import * as z from 'zod';
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { SpotifyClient } from '@/lib/spotify';
import { getUserById, getUserByIdPrivate, upsertUser } from '@/lib/supabase';

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { id } = req.query;

  if (typeof id !== 'string') {
    res.status(400).send('');
    return;
  }

  const timeRangeParsed = z.union([z.literal('short'), z.literal('medium'), z.literal('long')]).safeParse(req.query.timeRange);
  const timeRange = timeRangeParsed.success ? timeRangeParsed.data : 'short';

  const { name } = await getUserById(id);

  const { refreshToken: refreshTokenOld } = await getUserByIdPrivate(id);

  // 毎回リフレッシュするの良くないと思う
  const spotify = await SpotifyClient.fromRefreshToken(refreshTokenOld, {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URL,
  });

  const accessToken = spotify.getAccessToken();
  const refreshToken = spotify.getRefreshToken();

  await upsertUser({
    id,
    name,
    accessToken,
    refreshToken,
  });

  const resp = await spotify.getTopTracks({ timeRange });
  if ('error' in resp) {
    res.status(500).json(resp.error);
    return;
  }

  const { items: tracks } = resp;

  res
    .status(200)
    .json({ tracks });
};

export default handler;
