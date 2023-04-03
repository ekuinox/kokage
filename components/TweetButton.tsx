import { ActionIcon, Tooltip } from '@mantine/core';
import { IconBrandTwitterFilled } from '@tabler/icons-react';
import Link from 'next/link';

export interface TweetButtonProps {
  id: string;
}

const createComposeUrl = (id: string) => {
  const url = new URL('https://twitter.com/intent/tweet');
  const text = `わたしのよく聴いた曲をシェアします! ${process.env.NEXT_PUBLIC_ORIGIN}/user/${id}`;
  url.searchParams.append('text', text);
  return url.toString();
};

export const TweetButton = ({ id }: TweetButtonProps) => {
  return (
    <Tooltip label="シェア!">
      <ActionIcon
        component={Link}
        href={createComposeUrl(id)}
        target="_blank"
        variant="light"
        color="cyan"
        size={32}
        disabled={process.env.NEXT_PUBLIC_DISABLE_TWEET_BUTTON === '1'}
      >
        <IconBrandTwitterFilled />
      </ActionIcon>
    </Tooltip>
  );
};
