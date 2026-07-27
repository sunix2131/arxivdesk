import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Clock3, Sparkles } from 'lucide-react';
import type { PageProps } from './pageTypes';
import { SearchBar } from '../components/SearchBar';
import { Section } from '../components/Section';
import { PaperGrid } from '../components/PaperGrid';
import { SkeletonGrid } from '../components/SkeletonGrid';
import { isPaperInEnabledCategories } from '../lib/categories';
import { isToday } from '../lib/date';
import { useI18n } from '../lib/i18n';

export function Home(props: PageProps) {
  const { t } = useI18n();
  const visiblePapers = props.papers.filter((paper) => isPaperInEnabledCategories(paper, props.categories, props.enabledSlugs));
  const todaysPapers = visiblePapers.filter((paper) => isToday(paper.publishedAt));
  const savedPapers = props.papers.filter((paper) => props.states[paper.id]?.isSaved);
  const historyPapers = props.papers
    .filter((paper) => props.states[paper.id]?.viewedAt)
    .sort((a, b) => new Date(props.states[b.id].viewedAt || 0).getTime() - new Date(props.states[a.id].viewedAt || 0).getTime());
  const continueReading = historyPapers.filter((paper) => !props.states[paper.id]?.isRead);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-7 sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-reader-border bg-reader-card px-5 py-6 shadow-sm sm:px-7"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 -translate-y-1/2 translate-x-1/3 rounded-full bg-reader-accent/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-reader-border bg-reader-bg px-2.5 py-1.5 text-[11px] font-semibold text-reader-muted">
              <Sparkles className="h-3.5 w-3.5 text-reader-accent" /> {t('home.eyebrow')}
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.045em] text-reader-text sm:text-4xl">
              {t('home.greeting')}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-reader-muted">
              {t('home.subtitle')}
            </p>
          </div>
          <div className="space-y-4">
            <SearchBar />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-reader-border bg-reader-bg p-3">
                <p className="text-xl font-semibold text-reader-text">{todaysPapers.length}</p>
                <p className="mt-1 text-xs text-reader-muted">{t('home.statToday')}</p>
              </div>
              <div className="rounded-xl border border-reader-border bg-reader-bg p-3">
                <p className="text-xl font-semibold text-reader-text">{savedPapers.length}</p>
                <p className="mt-1 text-xs text-reader-muted">{t('home.statSaved')}</p>
              </div>
              <div className="rounded-xl border border-reader-border bg-reader-bg p-3">
                <p className="text-xl font-semibold text-reader-text">{historyPapers.length}</p>
                <p className="mt-1 text-xs text-reader-muted">{t('home.statViewed')}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {props.isLoading ? (
        <SkeletonGrid />
      ) : (
        <>
          <Section title={t('home.freshTitle')} description={t('home.freshDescription')} action={{ label: t('home.exploreAll'), to: '/explore' }}>
            <PaperGrid {...props} papers={todaysPapers.slice(0, 6)} emptyTitle={t('home.noNewTitle')} emptyDescription={t('home.noNewDescription')} />
          </Section>

          <Section title={t('home.newTitle')} description={t('home.newDescription')}>
            <PaperGrid {...props} papers={visiblePapers.slice(0, 6)} />
          </Section>

          <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
            <Section title={t('home.continueTitle')} action={{ label: t('nav.history'), to: '/history' }}>
              <PaperGrid {...props} papers={continueReading.slice(0, 2)} emptyTitle={t('home.nothingProgressTitle')} emptyDescription={t('home.nothingProgressDescription')} />
            </Section>
            <aside className="rounded-xl border border-reader-border bg-reader-card p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-reader-text">{t('home.quickFilters')}</h2>
              <div className="mt-4 grid gap-2">
                <Link to="/explore" className="flex items-center justify-between rounded-lg border border-reader-border bg-reader-bg px-3 py-2 text-xs font-medium text-reader-text">
                  <span className="inline-flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-reader-muted" />{t('filters.today')}</span>
                  <span className="text-reader-muted">{todaysPapers.length}</span>
                </Link>
                <Link to="/saved" className="flex items-center justify-between rounded-lg border border-reader-border bg-reader-bg px-3 py-2 text-xs font-medium text-reader-text">
                  <span className="inline-flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-reader-muted" />{t('nav.saved')}</span>
                  <span className="text-reader-muted">{savedPapers.length}</span>
                </Link>
                <Link to="/history" className="flex items-center justify-between rounded-lg border border-reader-border bg-reader-bg px-3 py-2 text-xs font-medium text-reader-text">
                  <span className="inline-flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-reader-muted" />{t('nav.history')}</span>
                  <span className="text-reader-muted">{historyPapers.length}</span>
                </Link>
              </div>
            </aside>
          </div>

          <section className="rounded-xl border border-reader-border bg-reader-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-reader-text">{t('home.recentTitle')}</h2>
                <p className="mt-1 text-sm text-reader-muted">{t('home.recentDescription')}</p>
              </div>
              <Link to="/history" className="inline-flex items-center gap-2 text-sm font-semibold text-reader-accent">
                {t('home.openHistory')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 divide-y divide-reader-border">
              {historyPapers.slice(0, 5).map((paper) => (
                <Link key={paper.id} to={`/paper/${paper.id}`} className="flex items-center justify-between gap-4 py-4 transition hover:text-reader-accent">
                  <span className="line-clamp-1 text-sm font-medium text-reader-text">{paper.title}</span>
                  <span className="shrink-0 text-xs text-reader-muted">{paper.id}</span>
                </Link>
              ))}
              {historyPapers.length === 0 ? <p className="py-5 text-sm text-reader-muted">{t('home.noViewed')}</p> : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
