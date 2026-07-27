import type { PageProps } from './pageTypes';
import { useI18n } from '../lib/i18n';
import type { Language, ThemePreference } from '../lib/storage';

type SettingsProps = PageProps & {
  themePreference: ThemePreference;
  onSetThemePreference: (theme: ThemePreference) => void;
  language: Language;
  onSetLanguage: (language: Language) => void;
};

export function Settings(props: SettingsProps) {
  const { t, categoryLabel } = useI18n();
  const toggleCategory = (slug: string) => {
    props.onSetEnabledSlugs(
      props.enabledSlugs.includes(slug) ? props.enabledSlugs.filter((item) => item !== slug) : [...props.enabledSlugs, slug]
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-7 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-reader-text sm:text-3xl">{t('settings.title')}</h1>
        <p className="mt-2 text-sm text-reader-muted">{t('settings.description')}</p>
      </div>

      <section className="rounded-xl border border-reader-border bg-reader-card p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-reader-text">{t('settings.categories')}</h2>
        <p className="mt-2 text-sm leading-6 text-reader-muted">{t('settings.categoriesDescription')}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {props.categories.map((category) => {
            const enabled = props.enabledSlugs.includes(category.slug);
            return (
              <button
                key={category.slug}
                onClick={() => toggleCategory(category.slug)}
                className={`rounded-lg border p-3 text-left transition hover:-translate-y-0.5 ${
                  enabled ? 'border-reader-accent bg-reader-accent/10' : 'border-reader-border bg-reader-bg'
                }`}
              >
                <span className="block text-sm font-semibold text-reader-text">
                  {enabled ? t('settings.on') : t('settings.off')} · {categoryLabel(category.slug, category.label)}
                </span>
                <span className="mt-1 block text-xs text-reader-muted">{category.arxiv.join(', ')}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-reader-border bg-reader-card p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-reader-text">{t('settings.theme')}</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {(['system', 'light', 'dark'] as ThemePreference[]).map((theme) => (
            <button
              key={theme}
              onClick={() => props.onSetThemePreference(theme)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition ${
                props.themePreference === theme ? 'border-reader-accent bg-reader-accent text-white' : 'border-reader-border bg-reader-bg text-reader-text'
              }`}
            >
              {t(`settings.theme.${theme}` as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-reader-border bg-reader-card p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-reader-text">{t('settings.language')}</h2>
        <p className="mt-2 text-sm leading-6 text-reader-muted">{t('settings.languageDescription')}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(['en', 'ru'] as Language[]).map((language) => (
            <button
              key={language}
              onClick={() => props.onSetLanguage(language)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                props.language === language ? 'border-reader-accent bg-reader-accent text-white' : 'border-reader-border bg-reader-bg text-reader-text'
              }`}
            >
              {t(`settings.language.${language}` as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-reader-border bg-reader-card p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-reader-text">{t('settings.localData')}</h2>
        <p className="mt-2 text-sm leading-6 text-reader-muted">{t('settings.localDataDescription')}</p>
        <button onClick={props.onClearHistory} className="mt-5 rounded-lg border border-reader-border bg-reader-bg px-3 py-2 text-xs font-semibold text-reader-text">
          {t('history.clear')}
        </button>
      </section>
    </div>
  );
}
