export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // If API request, let it pass or proxy
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'API requests should be directed to agent' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      // Fetch static assets from Cloudflare ASSETS binding
      let response = await env.ASSETS.fetch(request);
      if (response.status === 404) {
        // Fallback to index.html for SPA routing
        response = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
      }
      return response;
    } catch (err) {
      return new Response(`Nexus Dashboard Worker: ${err.message}`, { status: 500 });
    }
  }
};
