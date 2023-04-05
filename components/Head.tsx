import NextHead from 'next/head';

export interface HeadProps {
  ogUrl?: string;
  ogImg?: {
    width: number;
    height: number;
    url: string;
  };
}

export const Head = ({ ogUrl, ogImg }: HeadProps) => {
  return (
    <NextHead>
      <title>よく聴く曲をシェアするやつ</title>
      <meta name="description" content="Spotifyでよく聴く曲をシェアするやつ" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:title" content={'よく聴く曲をシェアするやつ'} />
      <meta property="og:site_name" content={'kokage'} />
      <meta property="og:description" content={'Spotifyでよく聴く曲をシェアするやつ'} />
      <meta property="og:type" content="website" />
      {ogImg && (
        <>
          <meta property="og:image" content={ogImg.url} />
          <meta property="og:image:width" content={ogImg.width.toString()} />
          <meta property="og:image:height" content={ogImg.height.toString()} />
          <meta property="twitter:card" content="summary_large_image" />
        </>
      )}
      <link rel="icon" href="/favicon.ico" />
    </NextHead>
  );
};
