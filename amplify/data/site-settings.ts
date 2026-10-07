/**
 * SiteSettings holds a single record. The admin creates it once with this id
 * and only updates it afterwards; the site reads it with get({ id }).
 * Kept apart from resource.ts so the frontend can import it without pulling
 * in @aws-amplify/backend.
 */
export const SITE_SETTINGS_ID = 'main';
