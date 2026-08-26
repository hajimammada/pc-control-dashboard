export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Automatically proxy all /api/ requests directly to the PC agent tunnel (agent.hajimammad.com)
    if (url.pathname.startsWith('/api/')) {
      const targetUrl = new URL(url.pathname + url.search, 'https://agent.hajimammad.com');
      
      const modifiedHeaders = new Headers(request.headers);
      modifiedHeaders.set('Host', 'agent.hajimammad.com');

      const proxyRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: modifiedHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
        redirect: 'follow'
      });

      try {
        const agentResponse = await fetch(proxyRequest);
        return agentResponse;
      } catch (err) {
        return new Response(JSON.stringify({ 
          success: false, 
          online: false, 
          error: `PC Agent tunnel offline or unreachable: ${err.message}` 
        }), {
          status: 502,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // Serve static dashboard web assets
    try {
      let response = await env.ASSETS.fetch(request);
      if (response.status === 404) {
        response = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
      }
      return response;
    } catch (err) {
      return new Response(`Nexus Dashboard: ${err.message}`, { status: 500 });
    }
  }
};
