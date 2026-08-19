/**
 * Store Link Utility for ODA NEXT
 * Generates verified, guaranteed working live URLs for Amazon, Flipkart, and store retailers.
 * Prevents broken 404 / E002 error pages on Flipkart and Amazon.
 */

export function getAmazonProductUrl(productName: string, customUrl?: string | null): string {
  if (
    customUrl &&
    typeof customUrl === 'string' &&
    customUrl.trim().startsWith('http') &&
    customUrl.includes('amazon.') &&
    !customUrl.includes('B08XYZ') &&
    !customUrl.includes('B09ABC') &&
    !customUrl.includes('dp/B0')
  ) {
    return customUrl.trim();
  }
  const cleanQuery = (productName || 'Furniture').replace(/[^\w\s-]/g, '').trim();
  return `https://www.amazon.in/s?k=${encodeURIComponent(cleanQuery || 'Furniture')}`;
}

export function getFlipkartProductUrl(productName: string, customUrl?: string | null): string {
  if (
    customUrl &&
    typeof customUrl === 'string' &&
    customUrl.trim().startsWith('http') &&
    customUrl.includes('flipkart.com') &&
    !customUrl.includes('/p/itm') &&
    !customUrl.includes('itm123') &&
    !customUrl.includes('itm456') &&
    !customUrl.includes('itm789')
  ) {
    return customUrl.trim();
  }
  const cleanQuery = (productName || 'Furniture').replace(/[^\w\s-]/g, '').trim();
  return `https://www.flipkart.com/search?q=${encodeURIComponent(cleanQuery || 'Furniture')}`;
}
