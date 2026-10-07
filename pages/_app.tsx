import '@/styles/base.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { IBM_Plex_Sans_Arabic, Noto_Kufi_Arabic } from 'next/font/google';

// Self-hosted by next/font. Only the regular heading weight is preloaded: the
// hero title is the largest paint. The medium weight (card titles) and IBM Plex
// (body) load without preload and swap in. Latin glyphs load on demand.
const kufi = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: '400',
  display: 'swap',
  variable: '--font-kufi',
});

const kufiMedium = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: '500',
  display: 'swap',
  preload: false,
  variable: '--font-kufi-medium',
});

const plex = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  display: 'swap',
  preload: false,
  variable: '--font-plex',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      {/* The font variables go on :root so dialogs and the body share them. */}
      <style jsx global>{`
        :root {
          --font-kufi: ${kufi.style.fontFamily};
          --font-kufi-medium: ${kufiMedium.style.fontFamily};
          --font-plex: ${plex.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
