import { useEffect, useRef, useState } from 'react';
import type { Paper } from '../types';
import { mergePapers, remotePageSize, searchArxivRemote, writeRemotePaperCache } from '../lib/arxivRemote';

export function useRemoteArxivSearch(query: string) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const requestId = useRef(0);
  const paginationController = useRef<AbortController>();

  const cleanQuery = query.trim();
  const canSearch = cleanQuery.length >= 2;
  const hasMore = canSearch && papers.length < total;

  useEffect(() => {
    const id = requestId.current + 1;
    requestId.current = id;
    const controller = new AbortController();
    paginationController.current?.abort();

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
      searchArxivRemote(cleanQuery, 0, controller.signal)
        .then((result) => {
          if (requestId.current !== id) return;
          setPapers(result.papers);
          setTotal(result.total);
          writeRemotePaperCache(result.papers);
        })
        .catch((searchError: Error) => {
          if (searchError.name === 'AbortError') return;
          if (requestId.current !== id) return;
          setPapers([]);
          setTotal(0);
          setError((searchError as Error).message);
        })
        .finally(() => {
          if (requestId.current === id) setIsLoading(false);
        });
    }, 550);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
      paginationController.current?.abort();
    };
  }, [canSearch, cleanQuery]);

  const loadMore = async () => {
    if (!canSearch || isLoading) return;

    const id = requestId.current;
    const offset = papers.length;
    const controller = new AbortController();
    paginationController.current?.abort();
    paginationController.current = controller;
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await searchArxivRemote(cleanQuery, offset, controller.signal);
      if (requestId.current !== id) return;
      writeRemotePaperCache(result.papers);
      setPapers((current) => mergePapers([...current, ...result.papers]));
      setTotal(result.total);
    } catch (loadError) {
      if ((loadError as Error).name === 'AbortError') return;
      if (requestId.current !== id) return;
      setError((loadError as Error).message);
    } finally {
      if (requestId.current === id && paginationController.current === controller) setIsLoading(false);
    }
  };

  return { papers, total, isLoading, error, hasMore, loadMore, pageSize: remotePageSize };
}
