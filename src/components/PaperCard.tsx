import { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2, FileText, Heart } from 'lucide-react';
import type { Category, Paper, UserPaperState } from '../types';
import { formatDate, isToday } from '../lib/date';
import { getPaperCategory } from '../lib/categories';
import { useI18n } from '../lib/i18n';
import { paperAbstract, paperTitle } from '../lib/paperText';

type PaperCardProps = {
  paper: Paper;
  categories: Category[];
  state?: UserPaperState;
  onToggleSaved: (paperId: string) => void;
  onMarkRead: (paperId: string, isRead: boolean) => void;
};

export function PaperCard({ paper, categories, state, onToggleSaved, onMarkRead }: PaperCardProps) {
  const { language, t } = useI18n();
  const category = getPaperCategory(paper, categories);
  const stop = (event: MouseEvent) => event.stopPropagation();
  const title = paperTitle(paper, language);
  const abstract = paperAbstract(paper, language);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex min-h-[184px] flex-col rounded-xl border border-reader-border bg-reader-card p-3.5 shadow-sm transition duration-300 ease-soft hover:-translate-y-0.5 hover:border-reader-accent/30 hover:shadow-lift dark:hover:shadow-darkLift"
    >
      <div className="flex items-center justify-between gap-3 text-xs font-semibold">
        <Link
          onClick={stop}
          to={`/category/${category?.slug || paper.primaryCategory}`}
          className="rounded bg-reader-accent/10 px-2 py-0.5 text-reader-accent"
        >
          {category?.short || paper.primaryCategory}
        </Link>
        <span className="text-reader-muted">{isToday(paper.publishedAt) ? t('card.today') : formatDate(paper.publishedAt, language)}</span>
      </div>

      <Link to={`/paper/${paper.id}`} className="mt-4 block">
        <h3 className="line-clamp-2 text-[14px] font-semibold leading-5 tracking-tight text-reader-text transition group-hover:text-reader-accent">
          {title}
        </h3>
      </Link>
      <p className="mt-2 line-clamp-1 text-xs text-reader-muted">{paper.authors.join(' · ')}</p>
      <p className="mt-3 line-clamp-2 text-xs leading-5 text-reader-muted">{abstract}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(paper.tags || paper.categories).slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-md border border-reader-border px-2 py-0.5 text-[11px] text-reader-muted">
            {tag}
          </span>
        ))}
        {paper.pages ? <span className="rounded-md border border-reader-border px-2 py-0.5 text-[11px] text-reader-muted">{paper.pages}</span> : null}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4">
        <Link
          to={`/paper/${paper.id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-reader-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5"
        >
          {t('card.open')} <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <a
          onClick={stop}
          href={paper.pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-reader-border px-3 py-1.5 text-xs font-semibold text-reader-text transition hover:-translate-y-0.5"
        >
          PDF <FileText className="h-3.5 w-3.5" />
        </a>
        <button
          onClick={() => onMarkRead(paper.id, !state?.isRead)}
          className={`ml-auto grid h-8 w-8 place-items-center rounded-lg border transition hover:-translate-y-0.5 ${
            state?.isRead ? 'border-reader-accent bg-reader-accent/10 text-reader-accent' : 'border-reader-border text-reader-muted'
          }`}
          aria-label={state?.isRead ? t('card.markUnread') : t('card.markRead')}
        >
          <CheckCircle2 className="h-4 w-4" />
        </button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggleSaved(paper.id)}
          className={`grid h-8 w-8 place-items-center rounded-lg border transition hover:-translate-y-0.5 ${
            state?.isSaved ? 'border-reader-accent bg-reader-accent text-white' : 'border-reader-border text-reader-muted'
          }`}
          aria-label={state?.isSaved ? t('card.unsave') : t('card.save')}
        >
          <Heart className="h-4 w-4" fill={state?.isSaved ? 'currentColor' : 'none'} />
        </motion.button>
      </div>
    </motion.article>
  );
}
