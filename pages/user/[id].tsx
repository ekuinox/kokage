import { Container } from '@mantine/core';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Head } from '@/components/Head';
import { Header } from '@/components/Header';
import { UserTopTracks, UserTopTracksProps } from '@/components/UserTopTracks';
import { getServerSideUserTopTracksProps } from '@/lib';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]';

type UserPageProps = UserTopTracksProps;

export const getServerSideProps: GetServerSideProps<UserPageProps> = async (
  context
) => {
  const session = await getServerSession(context.req, context.res, authOptions);

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
  return { props: { ...props, isSelf: session?.user?.id === id } };
};

export default function UserPage({
  user,
  topTracks,
  isSelf,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head />
      <main>
        <Header />
        <Container my="sm">
          <UserTopTracks user={user} topTracks={topTracks} isSelf={isSelf} />
        </Container>
      </main>
    </>
  );
}
