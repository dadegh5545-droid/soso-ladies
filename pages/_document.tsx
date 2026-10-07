import { Head, Html, Main, NextScript, type DocumentProps } from 'next/document';

/** Arabic (RTL) everywhere except the English page under /en. */
export default function Document({ __NEXT_DATA__ }: DocumentProps) {
  const page = __NEXT_DATA__.page;
  const english = page === '/en' || page.startsWith('/en/');
  return (
    <Html lang={english ? 'en' : 'ar'} dir={english ? 'ltr' : 'rtl'}>
      <Head>
        <meta name="theme-color" content="#E10485" />
        <link rel="icon" type="image/png" sizes="32x32" href="/brand/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/brand/favicon-512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/brand/favicon-180.png" />
        {/* Before first paint: scroll-reveal styles apply only when JS runs (styles/base.css). */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
