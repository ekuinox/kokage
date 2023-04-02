import { Track } from '@/lib/spotify';
import {
  Stack,
  Group,
  rem,
  Avatar,
  Title,
  SegmentedControl,
  Divider,
  createStyles,
} from '@mantine/core';
import Link from 'next/link';
import { useState } from 'react';
import { IframedTracks } from './IframedTracks';
import { PlaylistCreateButton, TimeRange, User } from './PlaylistCreateButton';
import { TweetButton } from './TweetButton';

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
      <Group position="apart" mx={rem(10)}>
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
        <SegmentedControl
          data={[
            { label: 'Short', value: 'short' },
            { label: 'Medium', value: 'medium' },
            { label: 'Long', value: 'long' },
          ]}
          value={timeRange}
          onChange={(value) => setTimeRange(value as typeof timeRange)}
        />
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
