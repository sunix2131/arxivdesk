import { useDeferredValue, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PageProps } from './pageTypes';
import { FilterBar } from '../components/FilterBar';
import { PaperList } from '../components/PaperList';
import { SearchBar } from '../components/SearchBar';
import { useRemoteArxivSearch } from '../hooks/useRemoteArxivSearch';
import { filterPapers, type FilterKey } from '../lib/search';
import { useI18n } from '../lib/i18n';
import { mergePapers } from '../lib/arxivRemote';

export function SearchPage(props: PageProps) {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const deferredQuery = useDeferredValue(query);
  const remote = useRemoteArxivSearch(deferredQuery);
  const localPapers = filterPapers({
    papers: props.papers,
    query: deferredQuery,
    activeFilter,
    categories: props.categories,
    enabledSlugs: props.enabledSlugs,
    states: props.states
  });
  const remotePapers = filterPapers({
    papers: remote.papers,
    query: '',
    activeFilter,
    categories: props.categories,
    enabledSlugs: props.enabledSlugs,
    states: props.states
  });
  const papers = mergePapers([...localPapers, ...remotePapers]);
  const hasRemoteQuery = deferredQuery.trim().length >= 2;

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-7 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-reader-text sm:text-3xl">{t('search.title')}</h1>
        <p className="mt-2 text-sm text-reader-muted">{t('search.description')}</p>
      </div>
      <SearchBar initialValue={query} onChange={setQuery} />
      <FilterBar activeFilter={activeFilter} onChange={setActiveFilter} categories={props.categories} />
      <div className="rounded-lg border border-reader-border bg-reader-card px-3 py-2 text-xs leading-5 text-reader-muted">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span>{t('search.localAndRemote')}: {papers.length}</span>
          <span>
            {remote.isLoading
              ? t('search.remoteLoading')
              : hasRemoteQuery
                ? `${remote.total} ${t('search.remoteFound')}`
                : t('search.remoteIdle')}
          </span>
        </div>
        {remote.error ? <p className="mt-1 text-reader-accent">{t('search.remoteError')}: {remote.error}</p> : null}
      </div>
      <PaperList {...props} papers={papers} emptyTitle={t('search.emptyTitle')} emptyDescription={t('search.emptyDescription')} />
      {hasRemoteQuery ? (
        <div className="flex justify-center">
          {remote.hasMore ? (
            <button
              onClick={remote.loadMore}
              disabled={remote.isLoading}
              className="rounded-lg border border-reader-border bg-reader-card px-4 py-2 text-sm font-semibold text-reader-text shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {remote.isLoading ? t('search.remoteLoading') : t('search.loadMore')}
            </button>
          ) : (
            <p className="text-xs text-reader-muted">{remote.isLoading ? t('search.remoteLoading') : t('search.noMore')}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
