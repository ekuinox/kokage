import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Anchor, Card, Container, Stack, Text, Title } from '@mantine/core';
import { Head } from '@/components/Head';
import { Header } from '@/components/Header';
import { UserTopTracks, UserTopTracksProps } from '@/components/UserTopTracks';
import { getServerSideUserTopTracksProps } from '@/lib';
import { authOptions } from './api/auth/[...nextauth]';

export default function Home({
  userTopTracksProps,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head />
      <main>
        <Header />
        <Container my="sm">
          {(userTopTracksProps && (
            <UserTopTracks {...userTopTracksProps} />
          )) || (
            <Stack mx="auto" align="center">
              <Title fz="lg">よく聴く曲をシェアするやつ</Title>
              <Text>
                Spotifyの連携を使ってよく聴いた曲をリストで出すやつです。
                <Anchor component={Link} href="/api/auth/signin">
                  ログイン
                </Anchor>
                してシェアしてみてください！
              </Text>
              <Card shadow="sm" padding="xs" mx="xl" radius="md" withBorder>
                <Card.Section>
                  <Image
                    src="/capture-sample.png"
                    alt="サンプル画像"
                    width={390}
                    height={617}
                  />
                </Card.Section>
              </Card>
              <Text>こんな感じのが出ます！</Text>
            </Stack>
          )}
        </Container>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{
  userTopTracksProps?: UserTopTracksProps;
}> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session?.user?.id == null) {
    return {
      props: {},
    };
  }

  const props = await getServerSideUserTopTracksProps(session.user.id);
  if (props == null) {
    return { props: {} };
  }
  return {
    props: {
      userTopTracksProps: props,
    },
  };
};
