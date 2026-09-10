// Static site worker — resilient asset passthrough
export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/healthz") {
        return new Response("ok", {
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
        });
      }
      const res = await env.ASSETS.fetch(request);
      // Avoid sticky broken caches on HTML
      if (res.status === 200 && (url.pathname === "/" || url.pathname.endsWith(".html"))) {
        const headers = new Headers(res.headers);
        headers.set("cache-control", "public, max-age=0, must-revalidate");
        return new Response(res.body, { status: res.status, headers });
      }
      return res;
    } catch (err) {
      return new Response("Temporary error loading site. Retry in a moment.", {
        status: 503,
        headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
      });
    }
  },
};
