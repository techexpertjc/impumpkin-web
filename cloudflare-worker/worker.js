/**
 * Decap CMS GitHub OAuth proxy — Cloudflare Worker
 *
 * Why this exists:
 * Decap CMS authenticates Pumpkin via GitHub OAuth so it can commit
 * blog posts to your repo. GitHub OAuth requires a server-side step
 * to exchange a code for an access token (you can't expose your client
 * secret in the browser). This Worker is that tiny server.
 *
 * Setup (also in README):
 *   1. Create a GitHub OAuth app at https://github.com/settings/developers
 *      - Homepage URL: https://pumpkinblog.web.app
 *      - Callback URL: https://decap-oauth-proxy.YOUR-WORKER.workers.dev/callback
 *   2. Deploy this worker to Cloudflare (free tier)
 *   3. In Cloudflare dashboard, set environment variables:
 *      - GITHUB_CLIENT_ID  = (from your OAuth app)
 *      - GITHUB_CLIENT_SECRET = (from your OAuth app)
 *   4. Update src/admin/config.yml `base_url` to point at the worker
 *
 * Reference: https://decapcms.org/docs/external-oauth-clients/
 */

const html = (token, type) => `<!doctype html>
<html><body><script>
  (function() {
    function receiveMessage(e) {
      console.log("receiveMessage %o", e);
      window.opener.postMessage(
        'authorization:github:${type}:${JSON.stringify({ token })}',
        e.origin
      );
      window.removeEventListener("message", receiveMessage, false);
    }
    window.addEventListener("message", receiveMessage, false);
    window.opener.postMessage("authorizing:github", "*");
  })();
</script></body></html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ─── Step 1: Decap calls /auth → redirect user to GitHub ───
    if (url.pathname === "/auth") {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: `${url.origin}/callback`,
        scope: "repo,user",
        state: crypto.randomUUID()
      });
      return Response.redirect(
        `https://github.com/login/oauth/authorize?${params}`,
        302
      );
    }

    // ─── Step 2: GitHub redirects back here with a code → exchange for token ───
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response(html(null, "error"), {
          headers: { "Content-Type": "text/html" }
        });
      }

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code
        })
      });

      const data = await tokenRes.json();
      if (data.error || !data.access_token) {
        return new Response(html(null, "error"), {
          headers: { "Content-Type": "text/html" }
        });
      }

      return new Response(html(data.access_token, "success"), {
        headers: { "Content-Type": "text/html" }
      });
    }

    return new Response("Decap OAuth proxy. See /auth.", { status: 200 });
  }
};
