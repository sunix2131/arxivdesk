import { useDeferredValue, useState } from 'react';
import type { PageProps } from './pageTypes';
import { FilterBar } from '../components/FilterBar';
import { PaperList } from '../components/PaperList';
import { SearchBar } from '../components/SearchBar';
import { SkeletonGrid } from '../components/SkeletonGrid';
import { filterPapers, quickFilters, type FilterKey } from '../lib/search';
import { useI18n } from '../lib/i18n';

export function Explore(props: PageProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const deferredQuery = useDeferredValue(query);
  const papers = filterPapers({
    papers: props.papers,
    query: deferredQuery,
    activeFilter,
    categories: props.categories,
    enabledSlugs: props.enabledSlugs,
    states: props.states
  });
  const filterCounts = Object.fromEntries(
    [
      ...quickFilters.map((filter) => filter.key),
      ...props.categories.filter((category) => category.enabledByDefault).slice(0, 7).map((category) => `category:${category.slug}` as FilterKey)
    ].map((filter) => [
      filter,
      filterPapers({
        papers: props.papers,
        query: deferredQuery,
        activeFilter: filter,
        categories: props.categories,
        enabledSlugs: props.enabledSlugs,
        states: props.states
      }).length
    ])
  ) as Partial<Record<FilterKey, number>>;
  const looksLikeRssLatestFeed = props.papers.length > 0 && (filterCounts.today || 0) / props.papers.length > 0.8;

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-7 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-reader-text sm:text-3xl">{t('explore.title')}</h1>
        <p className="mt-2 text-sm leading-6 text-reader-muted">{t('explore.description')}</p>
      </div>
      <SearchBar onChange={setQuery} />
      <FilterBar activeFilter={activeFilter} onChange={setActiveFilter} categories={props.categories} counts={filterCounts} />
      <div className="flex items-center justify-between text-xs text-reader-muted">
        <span>{papers.length} / {props.papers.length}</span>
        <span>{activeFilter}</span>
      </div>
      {looksLikeRssLatestFeed ? (
        <div className="rounded-lg border border-reader-border bg-reader-card px-3 py-2 text-xs leading-5 text-reader-muted">
          {t('explore.rssNotice')}
        </div>
      ) : null}
      {props.isLoading ? <SkeletonGrid /> : <PaperList {...props} papers={papers} />}
    </div>
  );
}
