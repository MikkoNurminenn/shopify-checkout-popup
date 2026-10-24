import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openCheckoutPopup, validateCheckoutUrl } from '../src/checkoutPopup.js';
import { buildCartPermalink } from '../src/cartPermalink.js';

const domain = 'example-demo.myshopify.com';
const url = `https://${domain}/cart/123:1`;
function browserWith(popup) {
  const calls = [];
  return { screen: { availWidth: 1440, availHeight: 900 }, calls,
    open(...args) { calls.push(args); return popup; } };
}

test('opens the checkout synchronously, detaches opener and focuses the popup', () => {
  let focused = false;
  const popup = { opener: {}, focus() { focused = true; } };
  const browser = browserWith(popup);
  assert.equal(openCheckoutPopup(url, { domain, browser }), true);
  assert.equal(popup.opener, null);
  assert.equal(focused, true);
  assert.equal(browser.calls[0][0], url);
  assert.match(browser.calls[0][2], /popup=yes,width=1080,height=820,left=180,top=40/);
});

test('reports blocked popups and unavailable browser environments', () => {
  assert.equal(openCheckoutPopup(url, { domain, browser: browserWith(null) }), false);
  assert.equal(openCheckoutPopup(url, { domain, browser: {} }), false);
});

test('reports a browser policy exception as blocked', () => {
  const browser = { open() { throw new Error('blocked'); } };
  assert.equal(openCheckoutPopup(url, { domain, browser }), false);
});

for (const invalid of [
  'https://attacker.example/cart/123:1',
  `http://${domain}/cart/123:1`,
  `https://${domain}.attacker.example/cart/123:1`,
  `https://user:secret@${domain}/cart/123:1`,
  `https://${domain}:8443/cart/123:1`,
  `https://${domain}/admin`,
]) {
  test(`rejects unsafe destination: ${invalid}`, () => {
    const browser = browserWith(null);
    assert.throws(() => openCheckoutPopup(invalid, { domain, browser }));
    assert.equal(browser.calls.length, 0);
  });
}

test('validates an existing Shopify checkout URL for a fallback link', () => {
  const checkout = `https://${domain}/checkouts/cn/example`;
  assert.equal(validateCheckoutUrl(checkout, domain).href, checkout);
});

test('creates a cart permalink containing the base product and selected accessories', () => {
  const link = new URL(buildCartPermalink({ domain,
    lines: [{ variantId: 'gid://shopify/ProductVariant/123' }, { variantId: '456', quantity: 2 }],
    attributes: { 'Hull color': '#123456', Source: 'Configurator' },
  }));
  assert.equal(link.pathname, '/cart/123:1,456:2');
  assert.equal(link.searchParams.get('attributes[Hull color]'), '#123456');
  assert.equal(link.searchParams.get('attributes[Source]'), 'Configurator');
});

test('rejects incomplete cart data instead of opening a different selection', () => {
  for (const lines of [[], [{ variantId: 'not-an-id' }], [{ variantId: '123', quantity: 0 }], [{ variantId: '123', quantity: 1.5 }]]) {
    assert.throws(() => buildCartPermalink({ domain, lines }));
  }
});
