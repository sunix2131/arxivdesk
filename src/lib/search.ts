import type { Category, Paper, UserPaperState } from '../types';
import { categoryMatchesPaper } from './categories';
import { daysAgo, isToday } from './date';

export type FilterKey =
  | 'all'
  | 'today'
  | 'week'
  | 'month'
  | 'saved'
  | 'unread'
  | 'read'
  | `category:${string}`;

export const quickFilters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'filters.all' },
  { key: 'today', label: 'filters.today' },
  { key: 'week', label: 'filters.week' },
  { key: 'month', label: 'filters.month' },
  { key: 'saved', label: 'filters.saved' },
  { key: 'unread', label: 'filters.unread' },
  { key: 'read', label: 'filters.read' }
];

export const filterPapers = ({
  papers,
  query,
  activeFilter,
  categories,
  states
}: {
  papers: Paper[];
  query: string;
  activeFilter: FilterKey;
  categories: Category[];
  enabledSlugs: string[];
  states: Record<string, UserPaperState>;
}) => {
  const normalized = query.trim().toLowerCase();
  const cutoffWeek = daysAgo(7);
  const cutoffMonth = daysAgo(31);

  return papers.filter((paper) => {
    const state = states[paper.id];
    const published = new Date(paper.publishedAt).getTime();

    if (activeFilter === 'today' && !isToday(paper.publishedAt)) return false;
    if (activeFilter === 'week' && published < cutoffWeek) return false;
    if (activeFilter === 'month' && published < cutoffMonth) return false;
    if (activeFilter === 'saved' && !state?.isSaved) return false;
    if (activeFilter === 'read' && !state?.isRead) return false;
    if (activeFilter === 'unread' && state?.isRead) return false;
    if (activeFilter.startsWith('category:')) {
      const slug = activeFilter.replace('category:', '');
      const category = categories.find((item) => item.slug === slug);
      if (!category || !categoryMatchesPaper(category, paper)) return false;
    }

    if (!normalized) return true;

    const haystack = [
      paper.id,
      paper.title,
      paper.titleRu || '',
      paper.abstract,
      paper.abstractRu || '',
      paper.primaryCategory,
      ...paper.categories,
      ...paper.authors,
      ...(paper.tags || [])
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
};
