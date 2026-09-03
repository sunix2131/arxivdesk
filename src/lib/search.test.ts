import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Category, Paper, UserPaperState } from '../types';
import { categoryMatchesPaper } from './categories';
import { isToday } from './date';
import { filterPapers, type FilterKey } from './search';

const categories: Category[] = [
  {
    slug: 'computer-science',
    label: 'Computer Science',
    arxiv: ['cs.*'],
    short: 'CS',
    enabledByDefault: true
  },
  {
    slug: 'mathematics',
    label: 'Mathematics',
    arxiv: ['math.*'],
    short: 'Math',
    enabledByDefault: false
  }
];

const papers: Paper[] = [
  {
    id: '2609.00001',
    title: 'Reliable event processing',
    titleRu: 'Надёжная обработка событий',
    abstract: 'Retries and idempotency in distributed systems',
    authors: ['Ada Engineer'],
    categories: ['cs.DC'],
    primaryCategory: 'cs.DC',
    publishedAt: '2026-09-04T08:00:00.000Z',
    updatedAt: '2026-09-04T08:00:00.000Z',
    arxivUrl: 'https://arxiv.org/abs/2609.00001',
    pdfUrl: 'https://arxiv.org/pdf/2609.00001',
    tags: ['queues']
  },
  {
    id: '2609.00002',
    title: 'Algebraic structures',
    abstract: 'A paper about groups',
    authors: ['Emmy Researcher'],
    categories: ['math.GR'],
    primaryCategory: 'math.GR',
    publishedAt: '2026-09-05T08:00:00.000Z',
    updatedAt: '2026-09-05T08:00:00.000Z',
    arxivUrl: 'https://arxiv.org/abs/2609.00002',
    pdfUrl: 'https://arxiv.org/pdf/2609.00002'
  }
];

const states: Record<string, UserPaperState> = {
  '2609.00001': {
    paperId: '2609.00001',
    isSaved: true,
    isRead: false
  },
  '2609.00002': {
    paperId: '2609.00002',
    isSaved: false,
    isRead: true
  }
};

const applyFilter = (activeFilter: FilterKey, query = '') =>
  filterPapers({
    papers,
    query,
    activeFilter,
    categories,
    enabledSlugs: categories.map((category) => category.slug),
    states
  });

afterEach(() => {
  vi.useRealTimers();
});

describe('date boundaries', () => {
  it('accepts only timestamps inside the current calendar day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 4, 12));

    expect(isToday(new Date(2026, 8, 4, 8).toISOString())).toBe(true);
    expect(isToday(new Date(2026, 8, 5, 8).toISOString())).toBe(false);
    expect(isToday(new Date(2026, 8, 3, 23, 59, 59).toISOString())).toBe(false);
  });
});

describe('paper filtering', () => {
  it('searches translated text, authors and tags case-insensitively', () => {
    expect(applyFilter('all', 'ОБРАБОТКА')).toEqual([papers[0]]);
    expect(applyFilter('all', 'ada engineer')).toEqual([papers[0]]);
    expect(applyFilter('all', 'QUEUES')).toEqual([papers[0]]);
  });

  it('uses persisted read and saved state', () => {
    expect(applyFilter('saved')).toEqual([papers[0]]);
    expect(applyFilter('unread')).toEqual([papers[0]]);
    expect(applyFilter('read')).toEqual([papers[1]]);
  });

  it('matches arXiv category families without matching another family', () => {
    expect(categoryMatchesPaper(categories[0], papers[0])).toBe(true);
    expect(categoryMatchesPaper(categories[0], papers[1])).toBe(false);
    expect(applyFilter('category:mathematics')).toEqual([papers[1]]);
  });

  it('does not include future papers in the today filter', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 4, 12));

    expect(applyFilter('today')).toEqual([papers[0]]);
  });
});
