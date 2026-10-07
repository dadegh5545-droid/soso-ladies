import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { publicCatalog } from '../functions/public-catalog/resource';

/*
 * Bilingual text: every *Ar field is the primary text and every *En field is
 * optional (the site falls back to Arabic when English is empty).
 *
 * Access: visitors read without signing in (guest, Cognito identity pool) and
 * only the OWNER group can create, update or delete. Visitors never read the
 * ServiceCategory, Service and GalleryImage tables directly: getPublicCatalog
 * returns the visible records only, filtered on the server.
 */
const schema = a.schema({
  ServiceAvailability: a.enum(['SALON', 'HOME', 'BOTH']),

  // Single record, always stored under SITE_SETTINGS_ID (./site-settings.ts).
  SiteSettings: a
    .model({
      salonNameAr: a.string().required(),
      salonNameEn: a.string(),
      // The site shows «جمالك شغفنا» when the Arabic tagline is empty.
      taglineAr: a.string(),
      taglineEn: a.string(),
      subtitleAr: a.string(),
      subtitleEn: a.string(),
      aboutAr: a.string(),
      aboutEn: a.string(),
      // International format, digits only (e.g. 9745XXXXXXX), as wa.me expects.
      whatsappNumber: a.string(),
      phone: a.string(),
      instagramUrl: a.url(),
      addressAr: a.string(),
      addressEn: a.string(),
      workingHoursAr: a.string(),
      workingHoursEn: a.string(),
      mapUrl: a.url(),
      latitude: a.float(),
      longitude: a.float(),
      heroVideoKey: a.string(),
      heroPosterKey: a.string(),
    })
    .authorization((allow) => [allow.guest().to(['read']), allow.group('OWNER')]),

  ServiceCategory: a
    .model({
      nameAr: a.string().required(),
      nameEn: a.string(),
      sortOrder: a.integer().default(0),
      isVisible: a.boolean().default(true),
      services: a.hasMany('Service', 'categoryId'),
    })
    .authorization((allow) => [allow.group('OWNER')]),

  Service: a
    .model({
      nameAr: a.string().required(),
      nameEn: a.string(),
      descriptionAr: a.string(),
      descriptionEn: a.string(),
      categoryId: a.id().required(),
      category: a.belongsTo('ServiceCategory', 'categoryId'),
      availability: a.ref('ServiceAvailability').required(),
      price: a.float(),
      durationMinutes: a.integer(),
      imageKey: a.string(),
      sortOrder: a.integer().default(0),
      isVisible: a.boolean().default(true),
    })
    .authorization((allow) => [allow.group('OWNER')]),

  GalleryImage: a
    .model({
      fileKey: a.string().required(),
      altAr: a.string().required(),
      altEn: a.string(),
      sortOrder: a.integer().default(0),
      isVisible: a.boolean().default(true),
    })
    .authorization((allow) => [allow.group('OWNER')]),

  // Public shapes: only the fields a visitor needs.
  PublicServiceCategory: a.customType({
    id: a.id().required(),
    nameAr: a.string().required(),
    nameEn: a.string(),
    sortOrder: a.integer(),
  }),

  PublicService: a.customType({
    id: a.id().required(),
    nameAr: a.string().required(),
    nameEn: a.string(),
    descriptionAr: a.string(),
    descriptionEn: a.string(),
    categoryId: a.id().required(),
    availability: a.ref('ServiceAvailability').required(),
    price: a.float(),
    durationMinutes: a.integer(),
    imageKey: a.string(),
    sortOrder: a.integer(),
  }),

  PublicGalleryImage: a.customType({
    id: a.id().required(),
    fileKey: a.string().required(),
    altAr: a.string().required(),
    altEn: a.string(),
    sortOrder: a.integer(),
  }),

  PublicCatalog: a.customType({
    categories: a.ref('PublicServiceCategory').required().array().required(),
    services: a.ref('PublicService').required().array().required(),
    galleryImages: a.ref('PublicGalleryImage').required().array().required(),
  }),

  // Visible categories, visible services of visible categories, and visible
  // gallery images, each sorted by sortOrder.
  getPublicCatalog: a
    .query()
    .returns(a.ref('PublicCatalog').required())
    .authorization((allow) => [allow.guest(), allow.group('OWNER')])
    .handler(a.handler.function(publicCatalog)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    // Visitors are the main audience; the admin passes authMode: 'userPool'.
    defaultAuthorizationMode: 'identityPool',
  },
});
