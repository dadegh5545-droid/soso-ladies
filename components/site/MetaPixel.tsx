import { useRouter } from 'next/router';
import Script from 'next/script';
import { useEffect } from 'react';
import { eventsForLink, pageViewPath, pixelBaseCode, pixelNoscriptSrc } from '@/lib/site/meta-pixel';

declare global {
  interface Window {
    fbq?: (command: 'init' | 'track', ...args: unknown[]) => void;
  }
}

/**
 * The page that last sent a PageView. Module state, because SiteLayout (and
 * this component with it) remounts on every client navigation between pages.
 */
let lastPagePath: string | null = null;

function track(event: string) {
  window.fbq?.('track', event);
}

/**
 * Meta Pixel for the public pages (SiteLayout renders it; the admin panel
 * does not). The base code runs once per visit and sends the first PageView;
 * each later client navigation to another page sends one more. A click on a
 * WhatsApp link sends Contact and Lead, a click on a phone link sends
 * Contact; the listener runs before the browser follows the link.
 */
export function MetaPixel() {
  const { asPath } = useRouter();

  useEffect(() => {
    const path = pageViewPath(asPath);
    if (lastPagePath === null) {
      // First public page of the visit: the base code sends its PageView.
      lastPagePath = path;
      return;
    }
    if (path === lastPagePath) return;
    lastPagePath = path;
    track('PageView');
  }, [asPath]);

  useEffect(() => {
    // One listener for every link, current and future (capture phase, so no
    // component's own click handler can stop it).
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      const link = target instanceof Element ? target.closest('a[href]') : null;
      if (!link) return;
      for (const name of eventsForLink(link.getAttribute('href') ?? '', window.location.href)) track(name);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return (
    <>
      {/* The id makes Next run the base code once, however often this remounts. */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {pixelBaseCode()}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img height="1" width="1" style={{ display: 'none' }} alt="" src={pixelNoscriptSrc()} />
      </noscript>
    </>
  );
}
