const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=3600"
};

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...JSON_HEADERS,
      ...(init.headers ?? {})
    }
  });
}

function isLogoCandidate(value = "") {
  return /校徽|校标|标志|学校标识|logo|seal|emblem|badge|crest/i.test(value);
}

function confidenceFor(title, url) {
  return isLogoCandidate(`${title} ${url}`) ? "high" : "medium";
}

function dedupe(candidates) {
  const seen = new Set();
  return candidates.filter((candidate) => {
    if (!candidate.url || seen.has(candidate.url)) {
      return false;
    }

    seen.add(candidate.url);
    return true;
  });
}

async function searchBing(school, env) {
  if (!env.BING_IMAGE_SEARCH_KEY) {
    return [];
  }

  const endpoint = env.BING_IMAGE_SEARCH_ENDPOINT
    || "https://api.bing.microsoft.com/v7.0/images/search";
  const params = new URLSearchParams({
    count: "12",
    mkt: "zh-CN",
    q: `${school} 校徽 logo 官方`,
    safeSearch: "Strict"
  });
  const response = await fetch(`${endpoint}?${params.toString()}`, {
    headers: {
      "Ocp-Apim-Subscription-Key": env.BING_IMAGE_SEARCH_KEY
    }
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return (data.value ?? []).map((item) => ({
    confidence: confidenceFor(item.name, item.contentUrl),
    source: "Bing",
    title: item.name || school,
    url: item.thumbnailUrl || item.contentUrl || ""
  }));
}

async function searchSerpApi(school, env) {
  if (!env.SERPAPI_KEY) {
    return [];
  }

  const params = new URLSearchParams({
    api_key: env.SERPAPI_KEY,
    engine: "google_images",
    google_domain: "google.com",
    hl: "zh-cn",
    q: `${school} 校徽 logo 官方`
  });
  const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return (data.images_results ?? []).slice(0, 12).map((item) => ({
    confidence: confidenceFor(item.title, item.original || item.thumbnail),
    source: "SerpAPI",
    title: item.title || school,
    url: item.thumbnail || item.original || ""
  }));
}

async function searchSearchApi(school, env) {
  if (!env.SEARCHAPI_KEY) {
    return [];
  }

  const params = new URLSearchParams({
    api_key: env.SEARCHAPI_KEY,
    engine: "google_images",
    hl: "zh-cn",
    q: `${school} 校徽 logo 官方`
  });
  const response = await fetch(`https://www.searchapi.io/api/v1/search?${params.toString()}`);
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return (data.images ?? data.images_results ?? []).slice(0, 12).map((item) => {
    const original = typeof item.original === "string" ? item.original : item.original?.link;
    const thumbnail = typeof item.thumbnail === "string" ? item.thumbnail : item.thumbnail?.link;
    return {
      confidence: confidenceFor(item.title, original || thumbnail),
      source: "SearchAPI",
      title: item.title || school,
      url: thumbnail || original || ""
    };
  });
}

async function searchBrave(school, env) {
  if (!env.BRAVE_SEARCH_API_KEY) {
    return [];
  }

  const params = new URLSearchParams({
    count: "12",
    country: "cn",
    q: `${school} 校徽 logo 官方`,
    safesearch: "strict",
    search_lang: "zh",
    spellcheck: "1"
  });
  const response = await fetch(`https://api.search.brave.com/res/v1/images/search?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": env.BRAVE_SEARCH_API_KEY
    }
  });
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return (data.results ?? []).slice(0, 12).map((item) => ({
    confidence: confidenceFor(item.title, item.properties?.url || item.thumbnail?.src),
    source: "Brave",
    title: item.title || school,
    url: item.thumbnail?.src || item.properties?.url || ""
  }));
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const school = url.searchParams.get("school")?.trim();

  if (!school) {
    return json({ candidates: [] }, { status: 400 });
  }

  const providers = await Promise.allSettled([
    searchBing(school, context.env),
    searchSerpApi(school, context.env),
    searchSearchApi(school, context.env),
    searchBrave(school, context.env)
  ]);
  const candidates = providers
    .flatMap((result) => result.status === "fulfilled" ? result.value : [])
    .filter((candidate) => candidate.url);

  candidates.sort((a, b) => {
    if (a.confidence === b.confidence) {
      return 0;
    }

    return a.confidence === "high" ? -1 : 1;
  });

  return json({ candidates: dedupe(candidates).slice(0, 12) });
}
