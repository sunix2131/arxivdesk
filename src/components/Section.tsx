import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type SectionProps = {
  title: string;
  description?: string;
  action?: { label: string; to: string };
  children: ReactNode;
};

export function Section({ title, description, action, children }: SectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-reader-text">{title}</h2>
          {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-reader-muted">{description}</p> : null}
        </div>
        {action ? (
          <Link to={action.to} className="text-sm font-semibold text-reader-accent transition hover:opacity-75">
            {action.label}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
