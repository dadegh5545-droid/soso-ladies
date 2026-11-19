/**
 * Meta Pixel on the public site (components/site/MetaPixel.tsx). The admin
 * panel never renders it.
 */

export const META_PIXEL_ID = '1764939187936330';

/** Standard Meta events the site sends besides PageView. */
export type ClickEvent = 'Contact' | 'Lead';

const WHATSAPP_HOSTS = new Set(['wa.me', 'api.whatsapp.com', 'web.whatsapp.com', 'whatsapp.com', 'www.whatsapp.com']);

/**
 * Events for a click on a link: WhatsApp (booking) links send Contact and
 * Lead, phone links send Contact, anything else sends nothing.
 */
export function eventsForLink(href: string, base: string): ClickEvent[] {
  let url: URL;
  try {
    url = new URL(href, base);
  } catch {
    return [];
  }
  if (url.protocol === 'tel:') return ['Contact'];
  if (url.protocol === 'whatsapp:') return ['Contact', 'Lead'];
  if ((url.protocol === 'https:' || url.protocol === 'http:') && WHATSAPP_HOSTS.has(url.hostname.toLowerCase())) {
    return ['Contact', 'Lead'];
  }
  return [];
}

/**
 * The page part of a URL path: client navigations that change only the query
 * (the services place filter) or the hash are not new page views.
 */
export function pageViewPath(asPath: string): string {
  return asPath.split(/[?#]/)[0] || '/';
}

/** The standard base code: loads fbevents.js, then init and the first PageView. */
export function pixelBaseCode(id: string = META_PIXEL_ID): string {
  return `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${id}');
fbq('track','PageView');`;
}

/** The <noscript> fallback image (PageView without JavaScript). */
export function pixelNoscriptSrc(id: string = META_PIXEL_ID): string {
  return `https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`;
}
