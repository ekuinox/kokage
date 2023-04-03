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
import { useState } from 'react';
import { IframedTracks } from './IframedTracks';
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
  topTracks: Record<TimeRange, Track[]>;
}

export const UserTopTracks = ({ user, topTracks }: UserTopTracksProps) => {
  const { classes } = useStyles();
  const [timeRange, setTimeRange] = useState<TimeRange>('short');

  return (
    <Stack>
      <Group position="apart">
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
          <TweetButton id={user.id} />
          <PlaylistCreateButton
            tracks={topTracks[timeRange]}
            timeRange={timeRange}
            user={user}
          />
        </Group>
      </Group>
      <Divider />
      <IframedTracks tracks={topTracks[timeRange]} />
    </Stack>
  );
};
