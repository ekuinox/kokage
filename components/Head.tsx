import NextHead from 'next/head';

export const Head = () => {
  return (
    <NextHead>
      <title>よく聴く曲をシェアするやつ</title>
      <meta name="description" content="よく聴く曲をシェアするやつ" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta property="og:url" content={'https://kokage.ekuinox.dev'} />
      <meta property="og:title" content={'よく聴く曲をシェアするやつ'} />
      <meta property="og:site_name" content={'よく聴く曲をシェアするやつ'} />
      <meta property="og:description" content={'よく聴く曲をシェアするやつ'} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={'https://github.com/ekuinox.png'} />
      <meta property="og:image:width" content={'400'} />
      <meta property="og:image:height" content={'400'} />
      <link rel="icon" href="/favicon.ico" />
    </NextHead>
  );
};
