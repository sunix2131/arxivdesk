import { Link } from 'react-router-dom';
import { CheckCircle2, Trash2 } from 'lucide-react';
import type { PageProps } from './pageTypes';
import { EmptyState } from '../components/EmptyState';
import { formatDateTime } from '../lib/date';
import { useI18n } from '../lib/i18n';

export function History(props: PageProps) {
  const { language, t } = useI18n();
  const papers = props.papers
    .filter((paper) => props.states[paper.id]?.viewedAt)
    .sort((a, b) => new Date(props.states[b.id].viewedAt || 0).getTime() - new Date(props.states[a.id].viewedAt || 0).getTime());

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-7 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-reader-text sm:text-3xl">{t('history.title')}</h1>
          <p className="mt-2 text-sm text-reader-muted">{t('history.description')}</p>
        </div>
        <button
          onClick={props.onClearHistory}
          className="rounded-lg border border-reader-border bg-reader-card px-3 py-2 text-xs font-semibold text-reader-text shadow-sm transition hover:-translate-y-0.5"
        >
          {t('history.clear')}
        </button>
      </div>

      {papers.length === 0 ? (
        <EmptyState title={t('history.emptyTitle')} description={t('history.emptyDescription')} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-reader-border bg-reader-card shadow-sm">
          {papers.map((paper) => (
            <div key={paper.id} className="grid gap-4 border-b border-reader-border px-4 py-3.5 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <Link to={`/paper/${paper.id}`} className="font-semibold leading-6 text-reader-text transition hover:text-reader-accent">
                  {paper.title}
                </Link>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-reader-muted">
                  <span>{formatDateTime(props.states[paper.id]?.viewedAt, language)}</span>
                  <span>{paper.id}</span>
                  <span>{props.states[paper.id]?.isRead ? t('history.read') : t('history.unread')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => props.onMarkRead(paper.id, !props.states[paper.id]?.isRead)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-reader-border text-reader-muted transition hover:text-reader-accent"
                  aria-label={t('history.toggleRead')}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => props.onRemoveHistory(paper.id)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-reader-border text-reader-muted transition hover:text-reader-accent"
                  aria-label={t('history.remove')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
