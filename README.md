# Shopify checkout popup

A small, dependency-free JavaScript helper for opening **Shopify's real hosted checkout** in a separate browser window while your configurator stays open.

Extracted and generalized from a working NORD27 3D configurator demo. Includes a plain HTML example, an optional React button, cart permalink generation, destination validation, and a normal-link fallback.

## Try the example

```sh
git clone https://github.com/MikkoNurminenn/shopify-checkout-popup.git
cd shopify-checkout-popup
npm run demo
```

Open [the local example](http://127.0.0.1:8000/examples/). Enter your development store's `myshopify.com` hostname and an available product's **variant ID**. No npm installation, Shopify app, API token, or admin credentials are required for the cart permalink approach. Python 3 is used only for the example's local static server.

## Use with a configurator

```js
import { buildCartPermalink } from './src/cartPermalink.js';
import { openCheckoutPopup } from './src/checkoutPopup.js';

const domain = 'your-store.myshopify.com';
const checkoutUrl = buildCartPermalink({
  domain,
  lines: [
    { variantId: '12345678901234', quantity: 1 }, // Base product: replace ID.
    { variantId: '23456789012345', quantity: 1 }, // Selected accessory: replace ID.
  ],
  attributes: { Source: 'Configurator', 'Hull color': 'Navy' },
});

const button = document.querySelector('#checkout');
const fallback = document.querySelector('#checkout-link');
fallback.href = checkoutUrl;
button.addEventListener('click', () => {
  if (!openCheckoutPopup(checkoutUrl, { domain })) {
    fallback.hidden = false;
  }
});
```

```html
<button id="checkout" type="button">Open Shopify checkout ↗</button>
<a id="checkout-link" hidden>Open checkout in this tab →</a>
```

Include the base product **and** the selected accessories as cart lines. Shopify reads their actual prices and availability from its catalog; this helper does not set or trust client-side prices. Cart attributes carry descriptive configuration details, not authoritative pricing.

Call `openCheckoutPopup` directly from the user's click. Prepare the checkout URL first: awaiting a cart API request inside the click handler can cause browsers to block the popup. You can also pass a `checkoutUrl` returned by Shopify's Storefront Cart API if it uses the configured hostname.

## React

Copy [CheckoutPopupButton.jsx](examples/react/CheckoutPopupButton.jsx) into your existing React application and adapt its import path:

```jsx
<CheckoutPopupButton url={checkoutUrl} domain="your-store.myshopify.com" />
```

React is only required by this optional example, not by the core helper or plain HTML example.

## What the browser and Shopify control

- A popup is requested at up to 1080 × 820 pixels. The browser may open it as a tab instead, especially on phones.
- The original configurator remains open. The popup's `opener` is detached immediately.
- The popup helper accepts only HTTPS cart/checkout URLs on the explicitly configured `myshopify.com` store hostname. It rejects credentials, extra ports, unrelated paths and foreign hosts. Custom checkout domains are outside this example's scope.
- A store's password page still applies. On a protected development store, authenticate in that browser first. If Shopify redirects to the storefront after password entry, return to the configurator and open the same checkout link again. This helper does not remove or bypass Shopify authentication.
- Use Shopify test payments for demonstrations. Opening checkout does not submit an order or charge a payment.
- The hosted checkout runs in a separate browser window, not inside an iframe.

## Test

```sh
npm test
```

Uses Node.js's built-in test runner (Node 20+), with no installed dependencies. Covers popup opening and blocking, opener isolation, destination rejection and cart contents.

This repository contains only the reusable integration code and examples. NORD27 3D assets, private store configuration, credentials and screen recordings are excluded.
