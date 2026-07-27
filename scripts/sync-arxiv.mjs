import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'public', 'data');
const papersPath = path.join(dataDir, 'papers.json');
const categoriesPath = path.join(dataDir, 'categories.json');
const DAYS_TO_KEEP = Number(process.env.ARXIV_DAYS_TO_KEEP || 90);
const PAGE_SIZE = Number(process.env.ARXIV_PAGE_SIZE || 100);
const MAX_RESULTS_PER_QUERY = Number(process.env.ARXIV_MAX_RESULTS || 5000);
const REQUEST_DELAY_MS = Number(process.env.ARXIV_REQUEST_DELAY_MS || 3000);
const MAX_RETRIES = Number(process.env.ARXIV_MAX_RETRIES || 4);
const RETRY_BASE_MS = Number(process.env.ARXIV_RETRY_BASE_MS || 15000);
const RSS_ONLY = process.env.ARXIV_RSS_ONLY === '1';
const CATEGORY_SLUGS = (process.env.ARXIV_CATEGORY_SLUGS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const DIRECT_QUERIES = (process.env.ARXIV_QUERIES || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryDelay = (response, attempt) => {
  const retryAfter = Number(response.headers.get('retry-after'));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return retryAfter * 1000;
  return RETRY_BASE_MS * attempt;
};

const textBetween = (source, tag) => {
  const match = source.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1].trim()) : '';
};

const decodeXml = (value) =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const readJson = async (filePath, fallback) => {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
};

const extractId = (entry) => textBetween(entry, 'id').split('/abs/')[1]?.replace(/v\d+$/, '') || '';

const parseEntry = (entry) => {
  const id = extractId(entry);
  const authors = [...entry.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/gi)].map((match) =>
    decodeXml(match[1])
  );
  const categories = [...entry.matchAll(/<category[^>]+term="([^"]+)"/gi)].map((match) => match[1]);
  const primaryCategory = entry.match(/<arxiv:primary_category[^>]+term="([^"]+)"/i)?.[1] || categories[0] || '';
  const pdfUrl = entry.match(/<link[^>]+title="pdf"[^>]+href="([^"]+)"/i)?.[1] || `https://arxiv.org/pdf/${id}`;

  return {
    id,
    title: textBetween(entry, 'title'),
    abstract: textBetween(entry, 'summary'),
    authors,
    categories,
    primaryCategory,
    publishedAt: textBetween(entry, 'published'),
    updatedAt: textBetween(entry, 'updated'),
    arxivUrl: `https://arxiv.org/abs/${id}`,
    pdfUrl,
    htmlUrl: `https://arxiv.org/html/${id}`,
    sourceUrl: `https://arxiv.org/e-print/${id}`
  };
};

const parseRssItem = (item, query) => {
  const link = textBetween(item, 'link');
  const id = link.split('/abs/')[1]?.replace(/v\d+$/, '') || textBetween(item, 'guid').match(/arXiv\.org:([^<]+)/)?.[1]?.replace(/v\d+$/, '') || '';
  const rawDescription = textBetween(item, 'description');
  const abstract = rawDescription.replace(/^arXiv:[^\n]+\s+Announce Type:[^\n]+\s+Abstract:\s*/i, '').trim();
  const authors = textBetween(item, 'dc:creator')
    .split(',')
    .map((author) => author.trim())
    .filter(Boolean);
  const categories = [...item.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)].map((match) => decodeXml(match[1]));
  const publishedAt = new Date(textBetween(item, 'pubDate')).toISOString();

  return {
    id,
    title: textBetween(item, 'title'),
    abstract,
    authors,
    categories: categories.length > 0 ? categories : [query],
    primaryCategory: categories[0] || query,
    publishedAt,
    updatedAt: publishedAt,
    arxivUrl: `https://arxiv.org/abs/${id}`,
    pdfUrl: `https://arxiv.org/pdf/${id}`,
    htmlUrl: `https://arxiv.org/html/${id}`,
    sourceUrl: `https://arxiv.org/e-print/${id}`
  };
};

const fetchRssCategory = async (query, cutoff) => {
  if (query.includes('*')) return [];

  const response = await fetch(`https://rss.arxiv.org/rss/${encodeURIComponent(query)}`, {
    headers: {
      'User-Agent': 'ResearchReader/0.1 personal arXiv reader; contact=local-user'
    }
  });

  if (!response.ok) {
    throw new Error(`RSS ${query}: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .map((match) => parseRssItem(match[1], query))
    .filter((paper) => paper.id && new Date(paper.publishedAt).getTime() >= cutoff);
};

const totalResults = (xml) => Number(xml.match(/<opensearch:totalResults[^>]*>(\d+)<\/opensearch:totalResults>/i)?.[1] || 0);

const fetchPage = async (query, start) => {
  const params = new URLSearchParams({
    search_query: `cat:${query}`,
    start: String(start),
    max_results: String(PAGE_SIZE),
    sortBy: 'submittedDate',
    sortOrder: 'descending'
  });

  let response;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    response = await fetch(`https://export.arxiv.org/api/query?${params}`, {
      headers: {
        'User-Agent': 'ResearchReader/0.1 personal arXiv reader; contact=local-user'
      }
    });

    if (response.ok) break;

    if (response.status !== 429 && response.status < 500) break;

    const waitMs = retryDelay(response, attempt);
    console.warn(`${query}: ${response.status} at start=${start}. Retrying in ${Math.round(waitMs / 1000)}s (${attempt}/${MAX_RETRIES})`);
    await delay(waitMs);
  }

  if (!response.ok) {
    throw new Error(`${query}: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const papers = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)].map((match) => parseEntry(match[1])).filter((paper) => paper.id);
  return { papers, total: totalResults(xml) };
};

const fetchCategory = async (query, cutoff) => {
  const collected = [];
  let start = 0;
  let total = Number.POSITIVE_INFINITY;

  while (start < total && collected.length < MAX_RESULTS_PER_QUERY) {
    const { papers, total: pageTotal } = await fetchPage(query, start);
    total = pageTotal || total;

    if (papers.length === 0) break;

    const freshPapers = papers.filter((paper) => new Date(paper.publishedAt).getTime() >= cutoff);
    collected.push(...freshPapers);

    console.log(`Fetched ${freshPapers.length}/${papers.length} papers for ${query} at ${start}-${start + papers.length - 1}`);

    if (freshPapers.length < papers.length) break;

    start += papers.length;
    if (start < total && collected.length < MAX_RESULTS_PER_QUERY) await delay(REQUEST_DELAY_MS);
  }

  if (collected.length >= MAX_RESULTS_PER_QUERY) {
    console.warn(`Stopped ${query} at ARXIV_MAX_RESULTS=${MAX_RESULTS_PER_QUERY}. Increase ARXIV_MAX_RESULTS to fetch deeper history.`);
  }

  return collected;
};

const run = async () => {
  await mkdir(dataDir, { recursive: true });
  const allCategories = await readJson(categoriesPath, []);
  const categories = CATEGORY_SLUGS.length > 0 ? allCategories.filter((category) => CATEGORY_SLUGS.includes(category.slug)) : allCategories;
  const queries = DIRECT_QUERIES.length > 0 ? [{ slug: 'direct', arxiv: DIRECT_QUERIES }] : categories;
  const previous = await readJson(papersPath, { updatedAt: new Date(0).toISOString(), papers: [] });
  const byId = new Map(previous.papers.map((paper) => [paper.id, paper]));
  const cutoff = Date.now() - DAYS_TO_KEEP * 24 * 60 * 60 * 1000;

  console.log(
    `Syncing arXiv for ${queries.length} category groups, ${DAYS_TO_KEEP} days, up to ${MAX_RESULTS_PER_QUERY} papers per query.`
  );

  for (const category of queries) {
    for (const query of category.arxiv || []) {
      try {
        const papers = RSS_ONLY ? await fetchRssCategory(query, cutoff) : await fetchCategory(query, cutoff);
        papers.forEach((paper) => byId.set(paper.id, { ...byId.get(paper.id), ...paper }));
        console.log(`Collected ${papers.length}${RSS_ONLY ? ' RSS' : ''} papers for ${query}`);
        await delay(REQUEST_DELAY_MS);
      } catch (error) {
        if (RSS_ONLY) {
          console.warn(`Skipping ${query}: ${error.message}`);
          continue;
        }
        console.warn(`API failed for ${query}: ${error.message}. Trying RSS fallback.`);
        try {
          const papers = await fetchRssCategory(query, cutoff);
          papers.forEach((paper) => byId.set(paper.id, { ...byId.get(paper.id), ...paper }));
          console.log(`Collected ${papers.length} RSS papers for ${query}`);
          await delay(REQUEST_DELAY_MS);
        } catch (rssError) {
          console.warn(`Skipping ${query}: ${rssError.message}`);
        }
      }
    }
  }

  const papers = [...byId.values()]
    .filter((paper) => new Date(paper.publishedAt).getTime() >= cutoff)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  await writeFile(papersPath, `${JSON.stringify({ updatedAt: new Date().toISOString(), papers })}\n`);
  console.log(`Saved ${papers.length} papers to ${path.relative(root, papersPath)}`);
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
