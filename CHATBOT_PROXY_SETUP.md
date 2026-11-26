# Chatbot proxy setup (before launch)

This repo is public. The chatbot currently calls the Anthropic API straight from the browser, using the constant in `chatbot-config.js`. Anything in browser code can be read by anyone, so a real key placed there can be stolen and used on your bill.

Use the placeholder (`PASTE_KEY_HERE`) in git. For real farmers, keep the key on a server and let the page talk to that server instead.

## Option A: Cloudflare Worker (minimal)

1. Create a Worker in the Cloudflare dashboard and paste this code.
2. In Worker settings, add a secret named `ANTHROPIC_API_KEY` (Settings, Variables and Secrets).
3. Change `ALLOWED_ORIGIN` to your site address from the `CNAME` file.

```js
const ALLOWED_ORIGIN = 'https://YOUR-SITE-ADDRESS';

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

    const { system, messages } = await request.json();

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      // Model and size limits are fixed here so visitors cannot change them
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system,
        messages: (messages || []).slice(-20),
      }),
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};
```

## Point the pages at the proxy

In `user-dashboard.html` and `kakedom-app.js`, change the `fetch` call:

- URL: `https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev` instead of `https://api.anthropic.com/v1/messages`
- Remove the `x-api-key`, `anthropic-version` and `anthropic-dangerous-direct-browser-access` headers
- Send only `{ system, messages }` in the body

Then remove `ANTHROPIC_API_KEY` from `chatbot-config.js`, and make `chatbotKeyMissing()` return `false`. The existing 401 and error handling will keep showing the friendly message if the proxy is down.

## Option B: Firebase Cloud Function

Same idea: an HTTPS function that reads the key from a secret (`firebase functions:secrets:set ANTHROPIC_API_KEY`), forwards `{ system, messages }` to the Messages API, and returns the response. Limit it to signed-in farmers by checking the Firebase ID token.

## Also do

- Set a monthly spend limit for the key in the Anthropic console.
- Rate limit the proxy per user or per IP (Cloudflare rate limiting rules, or a counter in the function).
- If a real key was ever pasted into a file in this folder, revoke it in the Anthropic console and create a new one.
