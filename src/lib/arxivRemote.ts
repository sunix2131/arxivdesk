import type { Paper } from '../types';

const PAGE_SIZE = 25;
const SESSION_KEY = 'research-reader:remote-papers:v1';
const API_URL = import.meta.env.VITE_ARXIV_API_URL || '/arxiv-api';

const readText = (element: Element, tag: string) => element.getElementsByTagName(tag)[0]?.textContent?.replace(/\s+/g, ' ').trim() || '';

const arxivIdFromUrl = (url: string) => url.split('/abs/')[1]?.replace(/v\d+$/, '') || '';

export const buildSearchQuery = (query: string) => {
  const trimmed = query.trim();
  if (/^\d{4}\.\d{4,5}(v\d+)?$/i.test(trimmed)) return { idList: trimmed.replace(/v\d+$/i, ''), searchQuery: '' };

  const terms = trimmed
    .split(/\s+/)
    .map((term) => term.replace(/[()]/g, ''))
    .filter(Boolean)
    .slice(0, 8);

  return { idList: '', searchQuery: terms.map((term) => `all:${term}`).join(' AND ') || `all:${trimmed}` };
};

export const buildSearchUrl = (query: string, start: number, apiUrl = API_URL) => {
  const { idList, searchQuery } = buildSearchQuery(query);
  const params = new URLSearchParams({
    start: String(start),
    max_results: String(PAGE_SIZE),
    sortBy: idList ? 'submittedDate' : 'relevance',
    sortOrder: 'descending'
  });

  if (idList) params.set('id_list', idList);
  else params.set('search_query', searchQuery);

  return `${apiUrl}?${params}`;
};

const fetchXml = async (url: string, signal?: AbortSignal) => {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`arXiv request failed: ${response.status} ${response.statusText}`);
  return response.text();
};

const parsePaper = (entry: Element): Paper => {
  const arxivUrl = readText(entry, 'id');
  const id = arxivIdFromUrl(arxivUrl);
  const authors = [...entry.getElementsByTagName('author')]
    .map((author) => readText(author, 'name'))
    .filter(Boolean);
  const categories = [...entry.getElementsByTagName('category')]
    .map((category) => category.getAttribute('term') || '')
    .filter(Boolean);
  const primaryCategory = entry.getElementsByTagName('arxiv:primary_category')[0]?.getAttribute('term') || categories[0] || '';
  const pdfUrl =
    [...entry.getElementsByTagName('link')].find((link) => link.getAttribute('title') === 'pdf')?.getAttribute('href') ||
    `https://arxiv.org/pdf/${id}`;

  return {
    id,
    title: readText(entry, 'title'),
    abstract: readText(entry, 'summary'),
    authors,
    categories,
    primaryCategory,
    publishedAt: readText(entry, 'published'),
    updatedAt: readText(entry, 'updated'),
    arxivUrl: `https://arxiv.org/abs/${id}`,
    pdfUrl,
    htmlUrl: `https://arxiv.org/html/${id}`,
    sourceUrl: `https://arxiv.org/e-print/${id}`
  };
};

export type RemoteSearchResult = {
  papers: Paper[];
  total: number;
};

export const searchArxivRemote = async (query: string, start: number, signal?: AbortSignal): Promise<RemoteSearchResult> => {
  const xml = await fetchXml(buildSearchUrl(query, start), signal);
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('arXiv returned invalid XML.');
  }
  const total = Number(doc.getElementsByTagName('opensearch:totalResults')[0]?.textContent || 0);
  const papers = [...doc.getElementsByTagName('entry')].map(parsePaper).filter((paper) => paper.id);

  return { papers, total };
};

export const mergePapers = (papers: Paper[]) => {
  const byId = new Map<string, Paper>();
  papers.forEach((paper) => byId.set(paper.id, { ...byId.get(paper.id), ...paper }));
  return [...byId.values()];
};

export const readRemotePaperCache = (): Paper[] => {
  try {
    return JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || '[]');
  } catch {
    return [];
  }
};

export const writeRemotePaperCache = (papers: Paper[]) => {
  try {
    const next = mergePapers([...readRemotePaperCache(), ...papers]).slice(0, 500);
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('remote-papers-updated', { detail: next }));
  } catch {
    // Session cache is optional. Search still works without it.
  }
};

export const remotePageSize = PAGE_SIZE;
