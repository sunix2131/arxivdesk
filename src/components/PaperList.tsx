import { Link } from 'react-router-dom';
import { Bookmark, CheckCircle2, FileText } from 'lucide-react';
import type { Category, Paper, UserPaperState } from '../types';
import { formatDate } from '../lib/date';
import { getPaperCategory } from '../lib/categories';
import { useI18n } from '../lib/i18n';
import { paperAbstract, paperTitle } from '../lib/paperText';
import { EmptyState } from './EmptyState';

type PaperListProps = {
  papers: Paper[];
  categories: Category[];
  states: Record<string, UserPaperState>;
  onToggleSaved: (paperId: string) => void;
  onMarkRead: (paperId: string, isRead: boolean) => void;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function PaperList({
  papers,
  categories,
  states,
  onToggleSaved,
  onMarkRead,
  emptyTitle,
  emptyDescription
}: PaperListProps) {
  const { language, t } = useI18n();

  if (papers.length === 0) {
    return <EmptyState title={emptyTitle || t('empty.defaultTitle')} description={emptyDescription || t('empty.defaultDescription')} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-reader-border bg-reader-card shadow-sm">
      {papers.map((paper) => {
        const state = states[paper.id];
        const category = getPaperCategory(paper, categories);
        const title = paperTitle(paper, language);
        const abstract = paperAbstract(paper, language);

        return (
          <article key={paper.id} className="group grid gap-3 border-b border-reader-border px-4 py-3.5 transition last:border-b-0 hover:bg-reader-bg/70 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Link to={`/category/${category?.slug || paper.primaryCategory}`} className="rounded bg-reader-accent/10 px-2 py-0.5 text-[11px] font-semibold text-reader-accent">
                  {category?.short || paper.primaryCategory}
                </Link>
                <span className="text-[11px] text-reader-muted">{formatDate(paper.publishedAt, language)}</span>
                {state?.isRead ? <span className="text-[11px] text-reader-muted">{t('history.read')}</span> : null}
              </div>
              <Link to={`/paper/${paper.id}`} className="line-clamp-1 text-sm font-semibold leading-5 text-reader-text transition group-hover:text-reader-accent">
                {title}
              </Link>
              <p className="mt-1 line-clamp-1 text-xs text-reader-muted">{paper.authors.join(', ')}</p>
              <p className="mt-2 line-clamp-2 max-w-4xl text-xs leading-5 text-reader-muted sm:hidden">{abstract}</p>
            </div>

            <div className="flex items-center gap-2 sm:justify-end">
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="grid h-8 w-8 place-items-center rounded-lg border border-reader-border text-reader-muted transition hover:text-reader-accent"
                aria-label="PDF"
              >
                <FileText className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={() => onMarkRead(paper.id, !state?.isRead)}
                className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
                  state?.isRead ? 'border-reader-accent bg-reader-accent/10 text-reader-accent' : 'border-reader-border text-reader-muted hover:text-reader-accent'
                }`}
                aria-label={state?.isRead ? t('card.markUnread') : t('card.markRead')}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onToggleSaved(paper.id)}
                className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
                  state?.isSaved ? 'border-reader-accent bg-reader-accent text-white' : 'border-reader-border text-reader-muted hover:text-reader-accent'
                }`}
                aria-label={state?.isSaved ? t('card.unsave') : t('card.save')}
              >
                <Bookmark className="h-3.5 w-3.5" fill={state?.isSaved ? 'currentColor' : 'none'} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
