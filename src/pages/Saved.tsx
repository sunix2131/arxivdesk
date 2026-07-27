import { useState } from 'react';
import type { PageProps } from './pageTypes';
import { FilterBar } from '../components/FilterBar';
import { PaperList } from '../components/PaperList';
import { filterPapers, type FilterKey } from '../lib/search';
import { useI18n } from '../lib/i18n';

export function Saved(props: PageProps) {
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('saved');
  const papers = filterPapers({
    papers: props.papers,
    query: '',
    activeFilter,
    categories: props.categories,
    enabledSlugs: props.enabledSlugs,
    states: props.states
  }).sort((a, b) => new Date(props.states[b.id]?.savedAt || 0).getTime() - new Date(props.states[a.id]?.savedAt || 0).getTime());

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-7 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-reader-text sm:text-3xl">{t('saved.title')}</h1>
        <p className="mt-2 text-sm text-reader-muted">{t('saved.description')}</p>
      </div>
      <FilterBar activeFilter={activeFilter} onChange={setActiveFilter} categories={props.categories} />
      <PaperList {...props} papers={papers} emptyTitle={t('home.noSavedTitle')} emptyDescription={t('saved.emptyDescription')} />
    </div>
  );
}
