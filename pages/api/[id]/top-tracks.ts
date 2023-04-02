import * as z from 'zod';
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { Track } from '@/lib/spotify';
import { getClient } from '@/lib';

export type TopTracksData = {
  topTracks: Track[];
};

const topTrackQueryParameterType = z.object({
  timeRange: z
    .union([z.literal('short'), z.literal('medium'), z.literal('long')])
    .default('short'),
  limit: z.number().default(5),
  offset: z.number().default(0),
});

export type TopTrackQueryParameter = z.infer<typeof topTrackQueryParameterType>;

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<TopTracksData | string>
) => {
  const { id } = req.query;

  if (typeof id !== 'string') {
    res.status(400).send('');
    return;
  }

  const params = topTrackQueryParameterType.safeParse(req.query);
  if (!params.success) {
    res.status(400).send('');
    return;
  }

  try {
    const [, client] = await getClient(id);

    const tracksResp = await client.getTopTracks(params.data);
    if ('error' in tracksResp) {
      res.status(500).json(tracksResp.message);
      return;
    }

    const { items: topTracks } = tracksResp;

    res.status(200).json({
      topTracks,
    });
  } catch (e: unknown) {
    res.status(500).json(`${e}`);
  }
};

export default handler;
