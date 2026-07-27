import type { Category, Paper, UserPaperState } from '../types';
import { useI18n } from '../lib/i18n';
import { EmptyState } from './EmptyState';
import { PaperCard } from './PaperCard';

type PaperGridProps = {
  papers: Paper[];
  categories: Category[];
  states: Record<string, UserPaperState>;
  onToggleSaved: (paperId: string) => void;
  onMarkRead: (paperId: string, isRead: boolean) => void;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function PaperGrid({
  papers,
  categories,
  states,
  onToggleSaved,
  onMarkRead,
  emptyTitle,
  emptyDescription
}: PaperGridProps) {
  const { t } = useI18n();

  if (papers.length === 0) {
    return <EmptyState title={emptyTitle || t('empty.defaultTitle')} description={emptyDescription || t('empty.defaultDescription')} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {papers.map((paper) => (
        <PaperCard
          key={paper.id}
          paper={paper}
          categories={categories}
          state={states[paper.id]}
          onToggleSaved={onToggleSaved}
          onMarkRead={onMarkRead}
        />
      ))}
    </div>
  );
}
