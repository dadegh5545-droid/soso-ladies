import { defineFunction } from '@aws-amplify/backend';

export const publicCatalog = defineFunction({
  name: 'public-catalog',
  entry: './handler.ts',
  timeoutSeconds: 10,
  // Lives in the data stack: it backs a data query and reads data tables,
  // which would otherwise make the two stacks depend on each other.
  resourceGroupName: 'data',
});
