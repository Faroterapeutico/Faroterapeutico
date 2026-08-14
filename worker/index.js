const extensionPattern = /\.[a-z0-9]+$/i;

async function fetchAsset(request, env, pathname) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = pathname;
  return env.ASSETS.fetch(new Request(assetUrl, request));
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);

    if (response.status !== 404) {
      return response;
    }

    if (url.pathname === "/") {
      return fetchAsset(request, env, "/index.html");
    }

    if (url.pathname.endsWith("/")) {
      response = await fetchAsset(request, env, `${url.pathname}index.html`);
    } else if (!extensionPattern.test(url.pathname)) {
      response = await fetchAsset(request, env, `${url.pathname}.html`);
    }

    return response;
  },
};

export default worker;
