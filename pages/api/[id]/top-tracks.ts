import * as z from 'zod';
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import dayjs from 'dayjs';
import { SpotifyClient, Track } from '@/lib/spotify';
import { getUserByIdPrivate, upsertUser } from '@/lib/supabase';

const getClient = async (
  id: string
): Promise<[name: string, client: SpotifyClient]> => {
  const {
    name,
    tokens: {
      accessToken: accessTokenOld,
      refreshToken,
      expiresAt: expiresAtOld,
      scopes: scopesOld,
    },
  } = await getUserByIdPrivate(id);

  // 現在時刻の1分後でもaccessTokenが生きている場合はそのままClient作って返す
  const afterOneMinute = dayjs().add(1, 'minute');
  if (afterOneMinute < dayjs(expiresAtOld)) {
    return [
      name,
      new SpotifyClient(accessTokenOld, refreshToken, expiresAtOld, scopesOld),
    ];
  }

  console.log(`start token refresh id=${id}`);

  // accessTokenがキレそうであれば新しくしてから返す
  const spotify = await SpotifyClient.fromRefreshToken(refreshToken, {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  const accessToken = spotify.getAccessToken();
  const expiresAt = spotify.getExpiresAt();
  const scopes = spotify.getScopes();

  if (expiresAt == null || scopes == null) {
    throw new Error('expiresAt or scopes are null');
  }

  await upsertUser({
    id,
    name,
    tokens: {
      accessToken,
      refreshToken,
      expiresAt,
      scopes,
    },
  });

  return [name, spotify];
};

export type TopTracksData = {
  topTracks: Track[];
  user: {
    name: string;
    id: string;
  };
};

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<TopTracksData | string>
) => {
  const { id } = req.query;

  if (typeof id !== 'string') {
    res.status(400).send('');
    return;
  }

  const timeRangeParsed = z
    .union([z.literal('short'), z.literal('medium'), z.literal('long')])
    .safeParse(req.query.timeRange);
  const timeRange = timeRangeParsed.success ? timeRangeParsed.data : 'short';

  try {
    const [name, client] = await getClient(id);

    const resp = await client.getTopTracks({ timeRange });
    if ('error' in resp) {
      res.status(500).json(resp.message);
      return;
    }

    const { items: topTracks } = resp;

    res.status(200).json({ topTracks, user: { name, id } });
  } catch (e: unknown) {
    res.status(500).json(`${e}`);
  }
};

export default handler;
