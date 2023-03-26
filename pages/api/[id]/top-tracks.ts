import * as z from 'zod';
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { Track } from '@/lib/spotify';
import { getClient } from '@/lib';

export type TopTracksData = {
  topTracks: Track[];
  user: {
    name: string;
    id: string;
    image: string | null;
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

    const profile = await client.getUserProfile(id);

    const tracksResp = await client.getTopTracks({ timeRange });
    if ('error' in tracksResp) {
      res.status(500).json(tracksResp.message);
      return;
    }

    const { items: topTracks } = tracksResp;
    const largestImage = profile.images.reduce((prev, current) => {
      if (prev == null) {
        return current;
      }
      if (
        current.width != null &&
        (prev.width == null || prev.width < current.width)
      ) {
        return current;
      }
      return prev;
    }, null as typeof profile.images[0] | null);

    res.status(200).json({
      topTracks,
      user: {
        name: profile.display_name,
        id: profile.id,
        image: largestImage?.url ?? null,
      },
    });
  } catch (e: unknown) {
    res.status(500).json(`${e}`);
  }
};

export default handler;
