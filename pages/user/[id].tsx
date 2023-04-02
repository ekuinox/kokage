import { Container } from '@mantine/core';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Head } from '@/components/Head';
import { Header } from '@/components/Header';
import { UserTopTracks, UserTopTracksProps } from '@/components/UserTopTracks';
import { getServerSideUserTopTracksProps } from '@/lib';

type UserPageProps = UserTopTracksProps;

export const getServerSideProps: GetServerSideProps<UserPageProps> = async (
  context
) => {
  const id = context.params?.id;

  if (typeof id !== 'string') {
    return {
      notFound: true,
    };
  }

  const props = await getServerSideUserTopTracksProps(id);
  if (props == null) {
    return { notFound: true };
  }
  return { props };
};

export default function UserPage({
  user,
  topTracks,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head />
      <main>
        <Header />
        <Container my="sm">
          <UserTopTracks user={user} topTracks={topTracks} />
        </Container>
      </main>
    </>
  );
}
