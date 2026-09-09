import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileArchive, FileText, Heart, PanelTopOpen } from 'lucide-react';
import type { PageProps } from './pageTypes';
import { EmptyState } from '../components/EmptyState';
import { PaperGrid } from '../components/PaperGrid';
import { Section } from '../components/Section';
import { formatFullDate } from '../lib/date';
import { useI18n } from '../lib/i18n';
import { paperAbstract, paperTitle } from '../lib/paperText';
import { readRemotePaperCache } from '../lib/arxivRemote';

export function PaperPage(props: PageProps) {
  const { language, t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const paper = props.papers.find((item) => item.id === id) || readRemotePaperCache().find((item) => item.id === id);
  const state = paper ? props.states[paper.id] : undefined;
  const title = paper ? paperTitle(paper, language) : '';
  const abstract = paper ? paperAbstract(paper, language) : '';

  useEffect(() => {
    if (paper) props.onMarkViewed(paper.id);
  }, [paper?.id, props.onMarkViewed]);

  if (!paper) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState title={t('paper.notFoundTitle')} description={t('paper.notFoundDescription')} />
      </div>
    );
  }

  const related = props.papers
    .filter((item) => item.id !== paper.id && item.categories.some((category) => paper.categories.includes(category)))
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="sticky top-14 z-20 -mx-4 border-b border-reader-border bg-reader-bg/85 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto">
          <button onClick={() => navigate(-1)} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-reader-border bg-reader-card px-3 py-2 text-xs font-semibold text-reader-text">
            <ArrowLeft className="h-4 w-4" /> {t('paper.back')}
          </button>
          <span className="hidden min-w-0 flex-1 truncate px-2 text-sm font-medium text-reader-muted md:block">{title}</span>
          <a href={paper.pdfUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-reader-accent px-3 py-2 text-xs font-semibold text-white">
            PDF
          </a>
          {paper.htmlUrl ? (
            <a href={paper.htmlUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-reader-border bg-reader-card px-3 py-2 text-xs font-semibold text-reader-text">
              HTML
            </a>
          ) : null}
          <a href={paper.arxivUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-reader-border bg-reader-card px-3 py-2 text-xs font-semibold text-reader-text">
            arXiv
          </a>
          <button
            onClick={() => props.onToggleSaved(paper.id)}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition ${
              state?.isSaved ? 'border-reader-accent bg-reader-accent text-white' : 'border-reader-border bg-reader-card text-reader-muted'
            }`}
            aria-label={state?.isSaved ? t('card.unsave') : t('card.save')}
          >
            <Heart className="h-4 w-4" fill={state?.isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <main className="space-y-8">
          <article className="rounded-xl border border-reader-border bg-reader-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap gap-2">
              {paper.categories.map((category) => (
                <span key={category} className="rounded-full bg-reader-accent/10 px-3 py-1.5 text-xs font-semibold text-reader-accent">
                  {category}
                </span>
              ))}
            </div>
            <h1 className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.035em] text-reader-text sm:text-3xl">{title}</h1>
            <p className="mt-4 text-sm leading-6 text-reader-muted">{paper.authors.join(' · ')}</p>

            <div className="mt-8 grid gap-3 text-sm text-reader-muted sm:grid-cols-2">
              <div className="rounded-lg border border-reader-border bg-reader-bg p-3">{t('paper.published')}: {formatFullDate(paper.publishedAt, language)}</div>
              <div className="rounded-lg border border-reader-border bg-reader-bg p-3">{t('paper.updated')}: {formatFullDate(paper.updatedAt, language)}</div>
              <div className="rounded-lg border border-reader-border bg-reader-bg p-3">arXiv ID: {paper.id}</div>
              <div className="rounded-lg border border-reader-border bg-reader-bg p-3">{t('paper.primary')}: {paper.primaryCategory}</div>
            </div>

            <div className="mt-9">
              <h2 className="text-xl font-semibold tracking-tight text-reader-text">{t('paper.abstract')}</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-reader-muted">{abstract}</p>
            </div>
          </article>

          <section className="rounded-xl border border-reader-border bg-reader-card p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-semibold tracking-tight text-reader-text">{t('paper.noteTitle')}</h2>
            <p className="mt-2 text-sm text-reader-muted">{t('paper.noteDescription')}</p>
            <textarea
              value={state?.note || ''}
              onChange={(event) => props.onSaveNote(paper.id, event.target.value)}
              placeholder={t('paper.notePlaceholder')}
              aria-label={t('paper.noteTitle')}
              className="mt-5 min-h-44 w-full resize-y rounded-lg border border-reader-border bg-reader-bg p-4 text-sm leading-6 text-reader-text outline-none transition placeholder:text-reader-muted focus:border-reader-accent/50 focus:ring-4 focus:ring-reader-accent/10"
            />
          </section>

          <Section title={t('paper.similarTitle')} description={t('paper.similarDescription')}>
            <PaperGrid {...props} papers={related} emptyTitle={t('paper.noSimilarTitle')} emptyDescription={t('paper.noSimilarDescription')} />
          </Section>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-36">
          <div className="rounded-xl border border-reader-border bg-reader-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-reader-muted">{t('paper.read')}</h2>
            <div className="mt-4 grid gap-2">
              <a href={paper.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between rounded-lg bg-reader-accent px-3 py-2.5 text-sm font-semibold text-white">
                {t('paper.readPdf')} <FileText className="h-4 w-4" />
              </a>
              {paper.htmlUrl ? (
                <a href={paper.htmlUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between rounded-lg border border-reader-border px-3 py-2.5 text-sm font-semibold text-reader-text">
                  {t('paper.readHtml')} <PanelTopOpen className="h-4 w-4" />
                </a>
              ) : null}
              <a href={paper.arxivUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between rounded-lg border border-reader-border px-3 py-2.5 text-sm font-semibold text-reader-text">
                {t('paper.openArxiv')} <ExternalLink className="h-4 w-4" />
              </a>
              {paper.sourceUrl ? (
                <a href={paper.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between rounded-lg border border-reader-border px-3 py-2.5 text-sm font-semibold text-reader-text">
                  {t('paper.sourceFiles')} <FileArchive className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-reader-border bg-reader-card p-4 shadow-sm">
            <h2 className="font-semibold text-reader-text">{t('paper.readingState')}</h2>
            <div className="mt-4 grid gap-2">
              <button onClick={() => props.onToggleSaved(paper.id)} className="rounded-lg border border-reader-border px-3 py-2.5 text-left text-sm font-semibold text-reader-text">
                {state?.isSaved ? t('paper.removeSaved') : t('paper.addSaved')}
              </button>
              <button onClick={() => props.onMarkRead(paper.id, !state?.isRead)} className="rounded-lg border border-reader-border px-3 py-2.5 text-left text-sm font-semibold text-reader-text">
                {state?.isRead ? t('paper.markUnread') : t('paper.markRead')}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
