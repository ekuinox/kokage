import { Anchor, Tooltip, ActionIcon, Text } from '@mantine/core';
import { upperFirst } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy } from '@tabler/icons-react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useCallback } from 'react';
import {
  CreatePlaylistRequest,
  CreatePlaylistResponse,
} from '@/pages/api/create-playlist';
import { Track } from '@/lib/spotify';

export interface User {
  name: string;
  id: string;
  image: string;
  url: string;
}
export type TimeRange = 'short' | 'medium' | 'long';

export interface PlaylistCreateButtonProps {
  user: Omit<User, 'image'>;
  tracks: Track[];
  timeRange: TimeRange;
  disabled?: boolean;
}

export const PlaylistCreateButton = ({
  user,
  tracks,
  timeRange,
  disabled,
}: PlaylistCreateButtonProps) => {
  const create = useCallback(() => {
    if (tracks.length === 0) {
      return;
    }
    const date = dayjs().format('YYYY-MM-DD');

    const request: CreatePlaylistRequest = {
      trackUris: tracks.map((track) => track.uri),
      name: `top-tracks-${user.name}-${timeRange}-${date}`,
      desc: `${user.name}'s Top Tracks of ${upperFirst(
        timeRange
      )} Time Range at ${date}`,
    };
    fetch('/api/create-playlist', {
      method: 'POST',
      body: JSON.stringify(request),
      headers: { 'content-type': 'application/json' },
    }).then(async (resp) => {
      if (resp.ok) {
        const data: CreatePlaylistResponse = await resp.json();
        notifications.show({
          title: 'プレイリストを作成しました!',
          message: (
            <>
              <Anchor component={Link} target="_blank" href={data.playlist.url}>
                {data.playlist.name}
              </Anchor>
              <Text>という名前で追加しました</Text>
            </>
          ),
        });
      }
    });
  }, [tracks]);

  return (
    <Tooltip label="プレイリストを作成する">
      <ActionIcon
        onClick={create}
        variant="filled"
        color="teal"
        disabled={disabled}
      >
        <IconDeviceFloppy />
      </ActionIcon>
    </Tooltip>
  );
};
