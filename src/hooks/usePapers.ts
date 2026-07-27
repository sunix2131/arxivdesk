import { useEffect, useState } from 'react';
import type { Category, Paper, PapersPayload } from '../types';

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

    const load = async () => {
      try {
        const [papersResponse, categoriesResponse] = await Promise.all([
          fetch('/data/papers.json'),
          fetch('/data/categories.json')
        ]);
        if (!papersResponse.ok || !categoriesResponse.ok) throw new Error('Could not load local paper data.');

        const payload = (await papersResponse.json()) as PapersPayload;
        const categories = (await categoriesResponse.json()) as Category[];
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
    };
  }, []);

  return state;
}
