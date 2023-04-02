import { getServerSession } from 'next-auth';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Container } from '@mantine/core';
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
        {userTopTracksProps && (
          <Container my="sm">
            <UserTopTracks {...userTopTracksProps} />
          </Container>
        )}
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
