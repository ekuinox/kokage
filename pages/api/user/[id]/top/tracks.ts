import { getClient } from '@/lib';
import { NextApiHandler } from 'next';
import * as z from 'zod';

const getTopTracksRequestType = z.object({
  limit: z.number().default(parseInt(process.env.TOP_TRACKS_LIMIT ?? '5')),
  offset: z.number().default(0),
  timeRange: z.union([
    z.literal('short'),
    z.literal('medium'),
    z.literal('long'),
  ]),
  id: z.string(),
});

export type GetTopTracksRequest = z.infer<typeof getTopTracksRequestType>;

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'max-age=60');

  const request = getTopTracksRequestType.safeParse(req.query);
  if (!request.success) {
    res.status(400).send('');
    return;
  }

  const {
    data: { id, timeRange, offset, limit },
  } = request;

  try {
    const [, client] = await getClient(id);

    const resp = await client.getTopTracks({ limit, offset, timeRange });

    if ('error' in resp) {
      res.status(500).send(resp.message);
      return;
    }

    res.json({ tracks: resp.items });
  } catch (e) {
    console.error({ e });
    res.status(404).send('');
    return;
  }
};

export default handler;
