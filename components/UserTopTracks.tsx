import { Track } from '@/lib/spotify';
import {
  Stack,
  Group,
  Avatar,
  Title,
  Divider,
  createStyles,
} from '@mantine/core';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { IframedTrack } from './IframedTrack';
import { PlaylistCreateButton, TimeRange, User } from './PlaylistCreateButton';
import { TweetButton } from './TweetButton';
import { TimeRangeControl } from './TimeRangeControl';

const useStyles = createStyles((theme) => ({
  username: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },
}));

export interface UserTopTracksProps {
  user: User;
  isSelf: boolean;
  topTracks: Record<TimeRange, Track[]>;
}

export const UserTopTracks = ({
  user,
  topTracks,
  isSelf,
}: UserTopTracksProps) => {
  const { classes } = useStyles();
  const [timeRange, setTimeRange] = useState<TimeRange>('short');

  const tracks = useMemo(
    () => (
      <>
        {topTracks[timeRange].map((track) => (
          <IframedTrack track={track} key={track.id} />
        ))}
      </>
    ),
    [topTracks, timeRange]
  );

  return (
    <Stack>
      <Group position="apart" mx="xs" spacing={0}>
        <Group>
          <Avatar
            src={user.image}
            component={Link}
            target="_blank"
            href={user.url}
          />
          <Title fz="md" className={classes.username}>
            {user.name}
          </Title>
        </Group>
        <TimeRangeControl value={timeRange} onChange={setTimeRange} />
        <Group>
          {isSelf && <TweetButton id={user.id} />}
          <PlaylistCreateButton
            tracks={topTracks[timeRange]}
            timeRange={timeRange}
            user={user}
          />
        </Group>
      </Group>
      <Divider />
      {tracks}
    </Stack>
  );
};
