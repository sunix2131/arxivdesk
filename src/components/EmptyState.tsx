import { Inbox } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-reader-border bg-reader-card/70 p-8 text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-reader-accent/10 text-reader-accent">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-reader-text">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-reader-muted">{description}</p>
    </div>
  );
}
