import type { Category, Paper, UserPaperState } from '../types';

export type PageProps = {
  papers: Paper[];
  categories: Category[];
  states: Record<string, UserPaperState>;
  enabledSlugs: string[];
  isLoading?: boolean;
  onToggleSaved: (paperId: string) => void;
  onMarkRead: (paperId: string, isRead: boolean) => void;
  onMarkViewed: (paperId: string) => void;
  onSaveNote: (paperId: string, note: string) => void;
  onRemoveHistory: (paperId: string) => void;
  onClearHistory: () => void;
  onSetEnabledSlugs: (slugs: string[]) => void;
};
