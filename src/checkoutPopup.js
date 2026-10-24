/** Return a normalized, explicitly configured Shopify store hostname. */
export function validateStoreDomain(domain) {
  const normalized = String(domain ?? '').trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(normalized)) {
    throw new Error('Configure your store hostname, e.g. your-store.myshopify.com.');
  }
  return normalized;
}

/** Validate before opening a window or showing a fallback link. */
export function validateCheckoutUrl(checkoutUrl, domain) {
  const store = validateStoreDomain(domain);
  const url = new URL(checkoutUrl);
  if (
    url.protocol !== 'https:' || url.hostname !== store || url.port
    || url.username || url.password
    || !/^\/(cart|checkouts)(\/|$)/.test(url.pathname)
  ) {
    throw new Error('Checkout URL must belong to the configured Shopify store.');
  }
  return url;
}

/**
 * Call directly and synchronously from a real user click.
 * Prepare a cart URL before the click; do not await a network request here.
 * Returns false when the browser cannot open a popup; offer a normal link.
 */
export function openCheckoutPopup(checkoutUrl, { domain, browser = globalThis.window } = {}) {
  const url = validateCheckoutUrl(checkoutUrl, domain);
  if (typeof browser?.open !== 'function') return false;
  const screenWidth = browser.screen?.availWidth || 1080;
  const screenHeight = browser.screen?.availHeight || 820;
  const width = Math.min(1080, screenWidth);
  const height = Math.min(820, screenHeight);
  const left = Math.max(0, Math.round((screenWidth - width) / 2));
  const top = Math.max(0, Math.round((screenHeight - height) / 2));
  let popup;
  try {
    popup = browser.open(url.href, 'shopify-checkout',
      `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);
  } catch {
    return false;
  }
  if (!popup) return false;
  popup.opener = null;
  popup.focus();
  return true;
}
