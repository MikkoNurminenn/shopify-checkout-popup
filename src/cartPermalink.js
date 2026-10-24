import { validateStoreDomain } from './checkoutPopup.js';

/** Shopify calculates prices from variant IDs; no prices are sent by the client. */
export function buildCartPermalink({ domain, lines, attributes = {} }) {
  const store = validateStoreDomain(domain);
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error('Provide at least one product variant.');
  }
  const path = lines.map(({ variantId, quantity = 1 }) => {
    const id = String(variantId ?? '').replace(/^gid:\/\/shopify\/ProductVariant\//, '');
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(quantity) || quantity < 1) {
      throw new Error('Use a numeric Shopify variant ID and a positive integer quantity.');
    }
    return `${id}:${quantity}`;
  }).join(',');
  const url = new URL(`https://${store}/cart/${path}`);
  for (const [key, value] of Object.entries(attributes)) {
    url.searchParams.set(`attributes[${key}]`, String(value));
  }
  return url.href;
}
