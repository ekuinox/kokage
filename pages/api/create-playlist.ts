import * as z from 'zod';
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { getClient } from '@/lib';

const CreatePlaylistRequestType = z.object({
  name: z.string(),
  desc: z.string(),
  trackUris: z.array(z.string()),
});

export type CreatePlaylistRequest = z.infer<typeof CreatePlaylistRequestType>;
export interface CreatePlaylistResponse {
  playlist: {
    id: string;
    name: string;
    desc: string | null;
    url: string;
  };
}

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<CreatePlaylistResponse | string>
) => {
  if (req.method !== 'POST') {
    return;
  }

  const session = await getServerSession<any, Session>(req, res, authOptions);
  const id = session?.user?.id;
  if (id == null) {
    res.status(400).send('session invalid');
    return;
  }

  // content-type:application/jsonが欲しい
  const requestBody = CreatePlaylistRequestType.safeParse(req.body);
  if (!requestBody.success) {
    console.error(requestBody.error);
    res.status(400).send('invalid request body');
    return;
  }

  const [, client] = await getClient(id);

  const playlist = await client.createPlaylist(id, {
    name: requestBody.data.name,
    description: requestBody.data.desc,
  });
  if ('error' in playlist) {
    return;
  }

  await client.updatePlaylistItems(playlist.id, requestBody.data.trackUris);

  res.status(200).json({
    playlist: {
      id: playlist.id,
      name: playlist.name,
      desc: playlist.description,
      url: playlist.external_urls['spotify'],
    },
  });
};

export default handler;
