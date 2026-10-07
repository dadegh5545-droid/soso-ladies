import { defineStorage } from '@aws-amplify/backend';

/**
 * Salon media. Visitors can read everything under these paths; only the
 * OWNER group can upload, replace or delete files.
 *
 * - media/hero/*      hero video and its poster image
 * - media/gallery/*   gallery images
 * - media/services/*  service images
 */
export const storage = defineStorage({
  name: 'sosoMedia',
  access: (allow) => ({
    'media/hero/*': [
      allow.guest.to(['read']),
      allow.groups(['OWNER']).to(['read', 'write', 'delete']),
    ],
    'media/gallery/*': [
      allow.guest.to(['read']),
      allow.groups(['OWNER']).to(['read', 'write', 'delete']),
    ],
    'media/services/*': [
      allow.guest.to(['read']),
      allow.groups(['OWNER']).to(['read', 'write', 'delete']),
    ],
  }),
});
