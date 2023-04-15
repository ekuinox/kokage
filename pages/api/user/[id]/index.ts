import { getClient } from '@/lib';
import { NextApiHandler } from 'next';
import * as z from 'zod';

const getTopTracksRequestType = z.object({
  id: z.string(),
});

export interface GetUserProfileResponse {
  id: string;
  name: string;
  url: string;
  imageUrl: string | null;
}

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'max-age=60');

  const request = getTopTracksRequestType.safeParse(req.query);
  if (!request.success) {
    res.status(400).send('');
    return;
  }

  const {
    data: { id },
  } = request;

  try {
    const [, client] = await getClient(id);

    const {
      display_name: name,
      images,
      external_urls: urls,
    } = await client.getUserProfile(id);

    res.json({
      id,
      name,
      url: urls['spotify'],
      imageUrl: images[0]?.url ?? null,
    });
  } catch (e) {
    console.error({ e });
    res.status(404).send('');
    return;
  }
};

export default handler;
