import { Link, useParams } from 'react-router-dom';
import type { PageProps } from './pageTypes';
import { PaperList } from '../components/PaperList';
import { categoryMatchesPaper } from '../lib/categories';
import { useI18n } from '../lib/i18n';

export function CategoryPage(props: PageProps) {
  const { t, categoryLabel } = useI18n();
  const { slug } = useParams();
  const category = props.categories.find((item) => item.slug === slug);
  const papers = category ? props.papers.filter((paper) => categoryMatchesPaper(category, paper)) : [];

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-7 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-reader-accent">{t('category.title')}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-reader-text sm:text-3xl">{category ? categoryLabel(category.slug, category.label) : slug}</h1>
          <p className="mt-2 text-sm text-reader-muted">{category?.arxiv.join(', ') || t('category.unknown')}</p>
        </div>
        <Link to="/settings" className="rounded-lg border border-reader-border bg-reader-card px-3 py-2 text-xs font-semibold text-reader-text shadow-sm">
          {t('category.edit')}
        </Link>
      </div>
      <PaperList {...props} papers={papers} />
    </div>
  );
}
