import { useEffect, useState } from 'react';
import type { Category, Paper, PapersPayload } from '../types';
import { isPaper } from '../lib/arxivRemote';

type PapersState = {
  papers: Paper[];
  categories: Category[];
  updatedAt?: string;
  isLoading: boolean;
  error?: string;
};

export function usePapers(): PapersState {
  const [state, setState] = useState<PapersState>({ papers: [], categories: [], isLoading: true });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      try {
        const [papersResponse, categoriesResponse] = await Promise.all([
          fetch('/data/papers.json', { signal: controller.signal }),
          fetch('/data/categories.json', { signal: controller.signal })
        ]);
        if (!papersResponse.ok || !papersResponse.headers.get('content-type')?.includes('application/json')) {
          throw new Error('No local paper snapshot. Run npm run sync in the project directory, then reload this page.');
        }
        if (!categoriesResponse.ok || !categoriesResponse.headers.get('content-type')?.includes('application/json')) {
          throw new Error('Could not load category settings from public/data/categories.json.');
        }

        const payload = (await papersResponse.json()) as PapersPayload;
        const categories = (await categoriesResponse.json()) as Category[];
        if (!payload || !Array.isArray(payload.papers) || !payload.papers.every(isPaper) ||
            !Array.isArray(categories) || !categories.every((category) => category && typeof category.slug === 'string' && Array.isArray(category.arxiv))) {
          throw new Error('The local paper snapshot is invalid. Run npm run sync to rebuild it.');
        }
        if (!cancelled) {
          setState({
            papers: payload.papers,
            categories,
            updatedAt: payload.updatedAt,
            isLoading: false
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ papers: [], categories: [], isLoading: false, error: (error as Error).message });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return state;
}
