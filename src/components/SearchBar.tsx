import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useI18n } from '../lib/i18n';

type SearchBarProps = {
  initialValue?: string;
  compact?: boolean;
  onChange?: (value: string) => void;
};

export function SearchBar({ initialValue = '', compact = false, onChange }: SearchBarProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [value, setValue] = useState(initialValue);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/search${value.trim() ? `?q=${encodeURIComponent(value.trim())}` : ''}`);
  };

  return (
    <form onSubmit={submit} className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-reader-muted" />
      <input
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          onChange?.(event.target.value);
        }}
        placeholder={t('search.placeholder')}
        className={`w-full rounded-lg border border-reader-border bg-reader-card/90 text-reader-text shadow-sm outline-none transition placeholder:text-reader-muted/75 focus:border-reader-accent/50 focus:ring-4 focus:ring-reader-accent/10 dark:bg-reader-bg/70 ${
          compact ? 'h-9 pl-10 pr-4 text-xs' : 'h-11 pl-11 pr-4 text-sm'
        }`}
      />
    </form>
  );
}
