import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, paginateScan } from '@aws-sdk/lib-dynamodb';
import type { Schema } from '../../data/resource';

type Catalog = Schema['PublicCatalog']['type'];

type CategoryRow = {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  sortOrder?: number | null;
};

type ServiceRow = {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  categoryId: string;
  availability: Catalog['services'][number]['availability'];
  price?: number | null;
  durationMinutes?: number | null;
  imageKey?: string | null;
  sortOrder?: number | null;
};

type GalleryImageRow = {
  id: string;
  fileKey: string;
  altAr: string;
  altEn?: string | null;
  sortOrder?: number | null;
};

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function tableName(envName: string): string {
  const name = process.env[envName];
  if (!name) {
    throw new Error(`${envName} is not set`);
  }
  return name;
}

// Hidden records (isVisible false or unset) are dropped by DynamoDB itself.
async function scanVisible<Row>(envName: string): Promise<Row[]> {
  const rows: Row[] = [];
  const pages = paginateScan(
    { client: db },
    {
      TableName: tableName(envName),
      FilterExpression: '#isVisible = :visible',
      ExpressionAttributeNames: { '#isVisible': 'isVisible' },
      ExpressionAttributeValues: { ':visible': true },
    },
  );
  for await (const page of pages) {
    rows.push(...((page.Items ?? []) as Row[]));
  }
  return rows;
}

function bySortOrder(
  a: { sortOrder?: number | null; id: string },
  b: { sortOrder?: number | null; id: string },
): number {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id);
}

export const handler: Schema['getPublicCatalog']['functionHandler'] = async () => {
  const [categories, services, galleryImages] = await Promise.all([
    scanVisible<CategoryRow>('SERVICE_CATEGORY_TABLE_NAME'),
    scanVisible<ServiceRow>('SERVICE_TABLE_NAME'),
    scanVisible<GalleryImageRow>('GALLERY_IMAGE_TABLE_NAME'),
  ]);

  // A visible service inside a hidden category stays hidden.
  const visibleCategoryIds = new Set(categories.map((category) => category.id));

  return {
    categories: categories.sort(bySortOrder).map((c) => ({
      id: c.id,
      nameAr: c.nameAr,
      nameEn: c.nameEn ?? null,
      sortOrder: c.sortOrder ?? null,
    })),
    services: services
      .filter((service) => visibleCategoryIds.has(service.categoryId))
      .sort(bySortOrder)
      .map((s) => ({
        id: s.id,
        nameAr: s.nameAr,
        nameEn: s.nameEn ?? null,
        descriptionAr: s.descriptionAr ?? null,
        descriptionEn: s.descriptionEn ?? null,
        categoryId: s.categoryId,
        availability: s.availability,
        price: s.price ?? null,
        durationMinutes: s.durationMinutes ?? null,
        imageKey: s.imageKey ?? null,
        sortOrder: s.sortOrder ?? null,
      })),
    galleryImages: galleryImages.sort(bySortOrder).map((g) => ({
      id: g.id,
      fileKey: g.fileKey,
      altAr: g.altAr,
      altEn: g.altEn ?? null,
      sortOrder: g.sortOrder ?? null,
    })),
  };
};
