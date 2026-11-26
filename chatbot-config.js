/* ── KÄKEDOM CHATBOT SETTINGS (the ONE place for the Anthropic key) ──
   Used by user-dashboard.html and kakedom-chatbot.html.

   SECURITY: this repo is public and a key in browser code is visible to
   anyone who opens the page. Never commit a real key. Before launch, move
   the key to a small server-side proxy (Cloudflare Worker or Firebase Cloud
   Function) and point the fetch calls at the proxy. See CHATBOT_PROXY_SETUP.md. */
var ANTHROPIC_API_KEY = 'PASTE_KEY_HERE';

var CHATBOT_UNAVAILABLE_MESSAGE = 'The assistant is not available right now. Please try again later.';

// True when no real key has been added yet
function chatbotKeyMissing() {
    return !ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'PASTE_KEY_HERE';
}
