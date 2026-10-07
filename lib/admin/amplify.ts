/**
 * Amplify for the admin panel only (the public pages never load it).
 * ssr: true keeps the session in cookies, so the server can send visitors
 * without a session straight to /admin/login (lib/server/admin-guard.ts).
 * Every data call uses the owner's user-pool token; the backend's OWNER
 * group rules are what actually allow or refuse each write.
 */
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import outputs from '@/amplify_outputs.json';
import type { Schema } from '@/amplify/data/resource';

Amplify.configure(outputs, { ssr: true });

export const adminClient = generateClient<Schema>({ authMode: 'userPool' });

export type SiteSettings = Schema['SiteSettings']['type'];
export type ServiceCategory = Schema['ServiceCategory']['type'];
export type Service = Schema['Service']['type'];
export type GalleryImage = Schema['GalleryImage']['type'];
export type Availability = NonNullable<Service['availability']>;
