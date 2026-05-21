import type { LogoCandidate } from "./types";
import { lines } from "./utils";

export async function fetchSchoolImages(
  schoolName: string,
  universityText: string
): Promise<{ best: LogoCandidate | null; candidates: LogoCandidate[] }> {
  const exactTitleCandidates = [
    schoolName,
    `${schoolName}校徽`,
    `${schoolName} 校徽`,
    `${schoolName} logo`,
    `${schoolName} Logo`
  ];

  const candidates: LogoCandidate[] = [];
  candidates.push(...await fetchHostedLogoApiImages(schoolName));
  candidates.push(...await fetchWikidataImages(schoolName));

  for (const title of exactTitleCandidates) {
    candidates.push(...await fetchWikipediaTitleImages(title, schoolName));
  }

  const searchCandidates = buildSearchQueries(schoolName, universityText);
  for (const query of searchCandidates) {
    candidates.push(...await fetchWikipediaSearchImages(query, schoolName, "zh"));
    candidates.push(...await fetchWikipediaSearchImages(query, schoolName, "en"));
    candidates.push(...await fetchWikipediaSearchImages(query, schoolName));
    candidates.push(...await fetchCommonsFileImages(query, schoolName));
  }

  const uniqueCandidates = dedupeLogoCandidates(candidates).slice(0, 8);
  const best = uniqueCandidates.find((candidate) => candidate.confidence === "high") ?? null;
  return { best, candidates: uniqueCandidates };
}

export function currentSchoolName(university: string): string {
  return lines(university)[0] ?? "";
}

export function normalizeSchoolName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[（）()《》〈〉\[\]\s·.,，。:：;；\-_/\\|]/g, "")
    .replace(/university|college|school|logo|seal|emblem|badge|校徽|标志|学校/g, "");
}

export function isLogoCandidate(title = "", imageUrl = "", pageImage = ""): boolean {
  const haystack = `${title} ${imageUrl} ${pageImage}`.toLowerCase();
  return /校徽|标志|logo|seal|emblem|badge/.test(haystack);
}

function buildSearchQueries(schoolName: string, universityText: string): string[] {
  const shortName = schoolName.replace(/大学|学院|职业技术学院|职业学院/g, "");
  const acronyms = extractLikelyAcronyms(universityText);
  return [
    `${schoolName} 校徽`,
    `${schoolName} logo`,
    `${schoolName} 标志`,
    `${schoolName} emblem`,
    `${schoolName} badge`,
    schoolName,
    `${shortName} 校徽`,
    `${shortName} logo`,
    ...acronyms.flatMap((acronym) => [`${acronym} logo`, `${acronym} emblem`, `${acronym} badge`])
  ].filter((query, index, all) => query.trim() && all.indexOf(query) === index);
}

function extractLikelyAcronyms(value: string): string[] {
  const matches = value.match(/\b[A-Z]{2,12}\b/g);
  return matches ? [...new Set(matches)] : [];
}

function titleMatchesSchool(title: string | undefined, schoolName: string): boolean {
  if (!title) {
    return false;
  }

  const normalizedTitle = normalizeSchoolName(title);
  const normalizedSchool = normalizeSchoolName(schoolName);
  return Boolean(normalizedSchool) && normalizedTitle.includes(normalizedSchool);
}

async function fetchHostedLogoApiImages(schoolName: string): Promise<LogoCandidate[]> {
  try {
    const response = await fetch(`/api/logo-search?school=${encodeURIComponent(schoolName)}`);
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
      return [];
    }

    const data = (await response.json()) as { candidates?: LogoCandidate[] };
    return data.candidates ?? [];
  } catch {
    return [];
  }
}

async function fetchWikipediaTitleImages(title: string, schoolName: string): Promise<LogoCandidate[]> {
  const params = new URLSearchParams({
    origin: "*",
    action: "query",
    redirects: "1",
    titles: title,
    prop: "pageimages",
    piprop: "thumbnail|name",
    pithumbsize: "180",
    format: "json"
  });
  const response = await fetch(`https://zh.wikipedia.org/w/api.php?${params.toString()}`);
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    query?: {
      pages?: Record<string, {
        missing?: boolean;
        pageimage?: string;
        thumbnail?: { source?: string };
        title?: string;
      }>;
    };
  };
  const pages = Object.values(data.query?.pages ?? {});
  return pages
    .filter((page) => !page.missing && page.thumbnail?.source && titleMatchesSchool(page.title, schoolName))
    .map((page) => ({
      source: "Wikipedia",
      title: page.title ?? title,
      url: page.thumbnail?.source ?? "",
      confidence: isLogoCandidate(page.title, page.thumbnail?.source, page.pageimage) ? "high" : "medium"
    }));
}

async function fetchWikipediaSearchImages(
  query: string,
  schoolName: string,
  language: "zh" | "en" = "zh"
): Promise<LogoCandidate[]> {
  const params = new URLSearchParams({
    origin: "*",
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "8",
    prop: "pageimages",
    piprop: "thumbnail|name",
    pithumbsize: "180",
    format: "json"
  });
  const response = await fetch(`https://${language}.wikipedia.org/w/api.php?${params.toString()}`);
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    query?: {
      pages?: Record<string, { pageimage?: string; thumbnail?: { source?: string }; title?: string }>;
    };
  };
  const pages = Object.values(data.query?.pages ?? {});
  return pages
    .filter((page) => page.thumbnail?.source && (titleMatchesSchool(page.title, schoolName) || isLogoCandidate(page.title, page.thumbnail?.source, page.pageimage)))
    .map((page) => ({
      source: language === "zh" ? "中文百科" : "英文百科",
      title: page.title ?? query,
      url: page.thumbnail?.source ?? "",
      confidence: isLogoCandidate(page.title, page.thumbnail?.source, page.pageimage) ? "high" : "medium"
    }));
}

async function fetchCommonsFileImages(query: string, schoolName: string): Promise<LogoCandidate[]> {
  const params = new URLSearchParams({
    origin: "*",
    action: "query",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: query,
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "180",
    format: "json"
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`);
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    query?: {
      pages?: Record<string, {
        imageinfo?: Array<{ thumburl?: string; url?: string }>;
        title?: string;
      }>;
    };
  };
  const pages = Object.values(data.query?.pages ?? {});
  return pages
    .filter((page) => page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url)
    .filter((page) => titleMatchesSchool(page.title, schoolName) || isLogoCandidate(page.title, page.imageinfo?.[0]?.thumburl, ""))
    .map((page) => ({
      source: "Commons",
      title: page.title?.replace(/^File:/, "") ?? query,
      url: page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url ?? "",
      confidence: isLogoCandidate(page.title, page.imageinfo?.[0]?.thumburl, "") ? "high" : "medium"
    }));
}

async function fetchWikidataImages(schoolName: string): Promise<LogoCandidate[]> {
  const ids = await fetchWikidataEntityIds(schoolName);
  if (!ids.length) {
    return [];
  }

  const params = new URLSearchParams({
    origin: "*",
    action: "wbgetentities",
    ids: ids.join("|"),
    props: "claims|labels|aliases",
    languages: "zh|en",
    format: "json"
  });
  const response = await fetch(`https://www.wikidata.org/w/api.php?${params.toString()}`);
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    entities?: Record<string, {
      aliases?: Record<string, Array<{ value?: string }>>;
      claims?: Record<string, Array<{ mainsnak?: { datavalue?: { value?: string } } }>>;
      labels?: Record<string, { value?: string }>;
    }>;
  };

  return Object.values(data.entities ?? {}).flatMap((entity) => {
    const entityNames = [
      entity.labels?.zh?.value,
      entity.labels?.en?.value,
      ...(entity.aliases?.zh ?? []).map((alias) => alias.value),
      ...(entity.aliases?.en ?? []).map((alias) => alias.value)
    ].filter((value): value is string => Boolean(value));
    const matchesSchool = entityNames.some((name) => titleMatchesSchool(name, schoolName));
    if (!matchesSchool) {
      return [];
    }

    const logoClaims = extractWikidataImageClaims(entity.claims, ["P154", "P94"]);
    const imageClaims = extractWikidataImageClaims(entity.claims, ["P18"]);
    return [
      ...logoClaims.map((fileName) => wikidataFileCandidate(fileName, "high")),
      ...imageClaims.map((fileName) => wikidataFileCandidate(fileName, "medium"))
    ];
  });
}

async function fetchWikidataEntityIds(schoolName: string): Promise<string[]> {
  const params = new URLSearchParams({
    origin: "*",
    action: "wbsearchentities",
    search: schoolName,
    language: "zh",
    uselang: "zh",
    limit: "8",
    format: "json"
  });
  const response = await fetch(`https://www.wikidata.org/w/api.php?${params.toString()}`);
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    search?: Array<{ aliases?: string[]; id?: string; label?: string }>;
  };
  return (data.search ?? [])
    .filter((item) =>
      titleMatchesSchool(item.label, schoolName)
      || (item.aliases ?? []).some((alias) => titleMatchesSchool(alias, schoolName))
    )
    .map((item) => item.id)
    .filter((id): id is string => Boolean(id));
}

function extractWikidataImageClaims(
  claims: Record<string, Array<{ mainsnak?: { datavalue?: { value?: string } } }>> | undefined,
  properties: string[]
): string[] {
  return properties.flatMap((property) =>
    (claims?.[property] ?? [])
      .map((claim) => claim.mainsnak?.datavalue?.value)
      .filter((value): value is string => Boolean(value))
  );
}

function wikidataFileCandidate(fileName: string, confidence: LogoCandidate["confidence"]): LogoCandidate {
  return {
    source: "Wikidata",
    title: fileName,
    url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=180`,
    confidence
  };
}

function dedupeLogoCandidates(candidates: LogoCandidate[]): LogoCandidate[] {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    if (!candidate.url || seen.has(candidate.url)) {
      return false;
    }

    seen.add(candidate.url);
    return true;
  });
}
