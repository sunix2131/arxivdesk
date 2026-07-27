const toLocale = (locale: string) => (locale === 'ru' ? 'ru-RU' : 'en');

export const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const daysAgo = (days: number) => Date.now() - days * 24 * 60 * 60 * 1000;

export const formatDate = (value: string, locale = 'en') =>
  new Intl.DateTimeFormat(toLocale(locale), { month: 'short', day: 'numeric' }).format(new Date(value));

export const formatFullDate = (value: string, locale = 'en') =>
  new Intl.DateTimeFormat(toLocale(locale), { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));

export const formatDateTime = (value?: string, locale = 'en') =>
  value
    ? new Intl.DateTimeFormat(toLocale(locale), {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(value))
    : locale === 'ru'
      ? 'Никогда'
      : 'Never';

export const isToday = (value: string) => new Date(value).getTime() >= startOfToday();
