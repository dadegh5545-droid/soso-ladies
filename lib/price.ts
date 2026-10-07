/**
 * Service prices are in Qatari riyals. Western digits with a thousands
 * separator, and no fraction when the amount is whole (1500 → "1,500",
 * 150.5 → "150.5"). Returns null for a missing, zero or invalid price.
 */
const NUMBER = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function formatPrice(price: number | null | undefined): string | null {
  return typeof price === 'number' && Number.isFinite(price) && price > 0 ? NUMBER.format(price) : null;
}
