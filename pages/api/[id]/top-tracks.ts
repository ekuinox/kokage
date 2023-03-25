import * as z from 'zod';
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { Track } from '@/lib/spotify';
import { getClient } from '@/lib';

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
