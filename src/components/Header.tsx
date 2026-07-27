import { Link, NavLink } from 'react-router-dom';
import { BookOpen, Menu, Moon, Search, Settings, Sun } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { useI18n } from '../lib/i18n';

const navItems = [
  { to: '/', label: 'nav.today' },
  { to: '/explore', label: 'nav.explore' },
  { to: '/saved', label: 'nav.saved' },
  { to: '/history', label: 'nav.history' }
];

type HeaderProps = {
  onToggleTheme: () => void;
};

export function Header({ onToggleTheme }: HeaderProps) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 border-b border-reader-border/80 bg-reader-card/88 backdrop-blur-xl supports-[backdrop-filter]:bg-reader-card/76">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex shrink-0 items-center gap-3" aria-label={`${t('app.name')} home`}>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-reader-accent text-white shadow-sm transition group-hover:-translate-y-0.5">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="hidden text-[13px] font-semibold tracking-tight text-reader-text sm:block">{t('app.name')}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  isActive ? 'bg-reader-accent/10 text-reader-accent' : 'text-reader-muted hover:bg-reader-bg hover:text-reader-text'
                }`
              }
            >
              {t(item.label as Parameters<typeof t>[0])}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden w-full max-w-sm md:block">
          <SearchBar compact />
        </div>

        <Link
          to="/search"
          className="ml-auto grid h-9 w-9 place-items-center rounded-lg border border-reader-border bg-reader-bg text-reader-text shadow-sm transition hover:-translate-y-0.5 md:hidden"
          aria-label={t('nav.search')}
        >
          <Search className="h-4 w-4" />
        </Link>
        <Link
          to="/saved"
          className="rounded-lg border border-reader-border bg-reader-bg px-3 py-2 text-xs font-medium text-reader-text shadow-sm transition hover:-translate-y-0.5 lg:hidden"
        >
          {t('nav.saved')}
        </Link>
        <button
          onClick={onToggleTheme}
          className="grid h-9 w-9 place-items-center rounded-lg border border-reader-border bg-reader-bg text-reader-text shadow-sm transition hover:-translate-y-0.5"
          aria-label={t('nav.toggleTheme')}
        >
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="hidden h-4 w-4 dark:block" />
        </button>
        <Link
          to="/settings"
          className="hidden h-9 w-9 place-items-center rounded-lg border border-reader-border bg-reader-bg text-reader-text shadow-sm transition hover:-translate-y-0.5 sm:grid"
          aria-label={t('nav.settings')}
        >
          <Settings className="h-4 w-4" />
        </Link>
        <Link
          to="/settings"
          className="grid h-9 w-9 place-items-center rounded-lg border border-reader-border bg-reader-bg text-reader-text shadow-sm transition hover:-translate-y-0.5 sm:hidden"
          aria-label={t('nav.menu')}
        >
          <Menu className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
