import { describe, expect, it } from 'vitest';

import type { Paper } from '../types';
import { buildSearchQuery, buildSearchUrl, mergePapers } from './arxivRemote';

const paper = (overrides: Partial<Paper> = {}): Paper => ({
  id: '2609.00001',
  title: 'Original title',
  abstract: 'Original abstract',
  authors: ['Ada Engineer'],
  categories: ['cs.DC'],
  primaryCategory: 'cs.DC',
  publishedAt: '2026-09-04T08:00:00.000Z',
  updatedAt: '2026-09-04T08:00:00.000Z',
  arxivUrl: 'https://arxiv.org/abs/2609.00001',
  pdfUrl: 'https://arxiv.org/pdf/2609.00001',
  ...overrides
});

describe('arXiv search requests', () => {
  it('uses id_list for a versioned arXiv identifier', () => {
    expect(buildSearchQuery('2609.00001v3')).toEqual({ idList: '2609.00001', searchQuery: '' });

    const url = new URL(buildSearchUrl('2609.00001v3', 0, 'https://example.test/api'));
    expect(url.searchParams.get('id_list')).toBe('2609.00001');
    expect(url.searchParams.has('search_query')).toBe(false);
  });

  it('limits and escapes free-text terms', () => {
    const query = ' one (two) three four five six seven eight nine ';
    const url = new URL(buildSearchUrl(query, 25, 'https://example.test/api'));

    expect(url.searchParams.get('start')).toBe('25');
    expect(url.searchParams.get('max_results')).toBe('25');
    expect(url.searchParams.get('search_query')).toBe(
      'all:one AND all:two AND all:three AND all:four AND all:five AND all:six AND all:seven AND all:eight'
    );
  });
});

describe('paper cache merge', () => {
  it('keeps local fields while applying newer fields for the same paper', () => {
    const merged = mergePapers([
      paper({ titleRu: 'Переведённый заголовок' }),
      paper({ title: 'Updated title', updatedAt: '2026-09-05T08:00:00.000Z' })
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0].title).toBe('Updated title');
    expect(merged[0].titleRu).toBe('Переведённый заголовок');
  });
});
