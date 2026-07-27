import { useEffect, useRef, useState } from 'react';
import type { Paper } from '../types';
import { mergePapers, remotePageSize, searchArxivRemote, writeRemotePaperCache } from '../lib/arxivRemote';

export function useRemoteArxivSearch(query: string) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const requestId = useRef(0);

  const cleanQuery = query.trim();
  const canSearch = cleanQuery.length >= 2;
  const hasMore = canSearch && papers.length < total;

  useEffect(() => {
    const id = requestId.current + 1;
    requestId.current = id;

    if (!canSearch) {
      setPapers([]);
      setTotal(0);
      setError(undefined);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    const timeout = window.setTimeout(() => {
      searchArxivRemote(cleanQuery, 0)
        .then((result) => {
          if (requestId.current !== id) return;
          setPapers(result.papers);
          setTotal(result.total);
          writeRemotePaperCache(result.papers);
        })
        .catch((searchError) => {
          if (requestId.current !== id) return;
          setPapers([]);
          setTotal(0);
          setError((searchError as Error).message);
        })
        .finally(() => {
          if (requestId.current === id) setIsLoading(false);
        });
    }, 550);

    return () => window.clearTimeout(timeout);
  }, [canSearch, cleanQuery]);

  const loadMore = async () => {
    if (!canSearch || isLoading) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const result = await searchArxivRemote(cleanQuery, papers.length);
      setPapers((current) => {
        const next = mergePapers([...current, ...result.papers]);
        writeRemotePaperCache(next);
        return next;
      });
      setTotal(result.total);
    } catch (loadError) {
      setError((loadError as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return { papers, total, isLoading, error, hasMore, loadMore, pageSize: remotePageSize };
}
