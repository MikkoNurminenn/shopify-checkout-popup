import React, { useState } from 'react';
import { openCheckoutPopup, validateCheckoutUrl } from '../../src/checkoutPopup.js';

/** Copy into an existing React application; adapt the import to your project. */
export default function CheckoutPopupButton({ url, domain }) {
  const [status, setStatus] = useState('');
  let safeUrl;
  try {
    safeUrl = validateCheckoutUrl(url, domain).href;
  } catch {
    return <p role="alert">Checkout is unavailable. Check the store and cart settings.</p>;
  }
  function open() {
    setStatus(openCheckoutPopup(safeUrl, { domain }) ? 'opened' : 'blocked');
  }
  return <div>
    <button type="button" onClick={open}>Open Shopify checkout ↗</button>
    {status === 'opened' && <p role="status">Checkout opened in a separate window. Your configuration stays here.</p>}
    {status === 'blocked' && <p role="status">Your browser blocked the popup. Use the link below.</p>}
    <p><a href={safeUrl}>Open checkout in this tab →</a></p>
  </div>;
}
