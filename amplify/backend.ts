import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { publicCatalog } from './functions/public-catalog/resource';
import { storage } from './storage/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
  publicCatalog,
});

// No self sign-up: users exist only when created by an admin in Cognito.
// A single-property override keeps the rest of AdminCreateUserConfig intact.
backend.auth.resources.cfnResources.cfnUserPool.addPropertyOverride(
  'AdminCreateUserConfig.AllowAdminCreateUserOnly',
  true,
);

// getPublicCatalog scans these tables directly, so it gets their names and
// read-only Scan access (nothing else).
const catalogTables = {
  SERVICE_CATEGORY_TABLE_NAME: 'ServiceCategory',
  SERVICE_TABLE_NAME: 'Service',
  GALLERY_IMAGE_TABLE_NAME: 'GalleryImage',
};
for (const [envName, modelName] of Object.entries(catalogTables)) {
  const table = backend.data.resources.tables[modelName];
  table.grant(backend.publicCatalog.resources.lambda, 'dynamodb:Scan');
  backend.publicCatalog.addEnvironment(envName, table.tableName);
}
