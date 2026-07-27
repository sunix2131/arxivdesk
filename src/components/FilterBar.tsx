import type { Category } from '../types';
import type { FilterKey } from '../lib/search';
import { quickFilters } from '../lib/search';
import { useI18n } from '../lib/i18n';

type FilterBarProps = {
  activeFilter: FilterKey;
  onChange: (filter: FilterKey) => void;
  categories: Category[];
  counts?: Partial<Record<FilterKey, number>>;
};

export function FilterBar({ activeFilter, onChange, categories, counts }: FilterBarProps) {
  const { t } = useI18n();
  const categoryFilters = categories.filter((category) => category.enabledByDefault).slice(0, 7);
  const filters = [...quickFilters, ...categoryFilters.map((category) => ({ key: `category:${category.slug}` as FilterKey, label: category.short }))];

  return (
    <div className="relative -mx-4 overflow-hidden px-4 sm:mx-0 sm:px-0">
      <div className="hide-scrollbar flex max-w-full gap-1.5 overflow-x-auto py-1 pr-8">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onChange(filter.key)}
            className={`inline-flex shrink-0 items-center rounded-lg border px-2.5 py-1.5 text-[11px] font-medium leading-none transition active:scale-[0.98] sm:px-3 sm:text-xs ${
              activeFilter === filter.key
                ? 'border-reader-accent bg-reader-accent text-white shadow-sm dark:text-white'
                : 'border-reader-border bg-reader-card text-reader-muted hover:-translate-y-0.5 hover:text-reader-text'
            }`}
          >
            <span>{filter.label.startsWith('filters.') ? t(filter.label as Parameters<typeof t>[0]) : filter.label}</span>
            {typeof counts?.[filter.key] === 'number' ? <span className="ml-1.5 opacity-70 sm:ml-2">{counts[filter.key]}</span> : null}
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-reader-bg to-transparent" />
    </div>
  );
}
