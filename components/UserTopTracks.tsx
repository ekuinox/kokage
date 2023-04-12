import {
  Stack,
  Group,
  Avatar,
  Title,
  Divider,
  createStyles,
} from '@mantine/core';
import Link from 'next/link';
import useSWR from 'swr';
import { useState } from 'react';
import { Track } from '@/lib/spotify';
import { GetUserProfileResponse } from '@/pages/api/user/[id]';
import { TweetButton } from './TweetButton';
import { IframeTrackView } from './IframedTrackView';
import { TimeRangeControl } from './TimeRangeControl';
import { TrackView as DefaultTrackView } from './TrackView';
import { PlaylistCreateButton, TimeRange, User } from './PlaylistCreateButton';

const TrackView =
  process.env.NEXT_PUBLIC_WITHOUT_IFRAME_TRACK_VIEW === '1'
    ? DefaultTrackView
    : IframeTrackView;

const useStyles = createStyles((theme) => ({
  username: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },
}));

const getUser = async (id: string): Promise<GetUserProfileResponse> => {
  const resp = await fetch(`/api/user/${id}`);
  if (!resp.ok) {
    throw new Error(await resp.text());
  }
  return resp.json();
};

const getTopTracks = async (
  id: string,
  timeRange: 'short' | 'medium' | 'long'
): Promise<Track[]> => {
  const resp = await fetch(`/api/user/${id}/top/tracks?timeRange=${timeRange}`);
  if (!resp.ok) {
    throw new Error(await resp.text());
  }
  const json = await resp.json();
  return json.tracks;
};

export interface UserTopTracksProps {
  user: Pick<User, 'id'>;
  isSelf: boolean;
}

export const UserTopTracks = ({ user: { id }, isSelf }: UserTopTracksProps) => {
  const { classes } = useStyles();
  const [timeRange, setTimeRange] = useState<TimeRange>('short');
  const { data: user } = useSWR(`/api/user/${id}`, () => getUser(id));
  const { data: topTracks } = useSWR(
    `/api/user/${id}/top/tracks?timeRange=${timeRange}`,
    () => getTopTracks(id, timeRange)
  );

  return (
    <Stack>
      <Group position="apart" mx="xs" spacing={0}>
        <Group>
          {user && (
            <>
              <Avatar
                src={user.imageUrl}
                component={Link}
                target="_blank"
                href={user.url}
              />
              <Title fz="md" className={classes.username}>
                {user.name}
              </Title>
            </>
          )}
        </Group>
        <TimeRangeControl value={timeRange} onChange={setTimeRange} />
        <Group>
          {isSelf && <TweetButton id={id} />}
          {user && topTracks && (
            <PlaylistCreateButton
              tracks={topTracks ?? []}
              timeRange={timeRange}
              username={user?.name}
            />
          )}
        </Group>
      </Group>
      <Divider />
      <>
        {topTracks &&
          topTracks.map((track) => <TrackView track={track} key={track.id} />)}
      </>
    </Stack>
  );
};
