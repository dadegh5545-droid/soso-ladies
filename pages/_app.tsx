import '@/styles/base.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { IBM_Plex_Sans_Arabic, Noto_Kufi_Arabic } from 'next/font/google';

// Self-hosted by next/font. Only the Arabic files are preloaded; Latin glyphs
// load on demand (English page, numbers).
const kufi = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-kufi',
});

const plex = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  display: 'swap',
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
          --font-plex: ${plex.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
