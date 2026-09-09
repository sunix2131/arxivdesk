import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from './components/Header';
import { useLocalPaperState } from './hooks/useLocalPaperState';
import { usePapers } from './hooks/usePapers';
import { useTheme } from './hooks/useTheme';
import { defaultEnabledCategories } from './lib/categories';
import { useI18n } from './lib/i18n';
import { mergePapers, readRemotePaperCache, writeRemotePaperCache } from './lib/arxivRemote';
import { readEnabledCategories, writeEnabledCategories, storageFailures } from './lib/storage';
import { CategoryPage } from './pages/CategoryPage';
import { Explore } from './pages/Explore';
import { History } from './pages/History';
import { Home } from './pages/Home';
import { PaperPage } from './pages/PaperPage';
import { Saved } from './pages/Saved';
import { SearchPage } from './pages/SearchPage';
import { Settings } from './pages/Settings';

export default function App() {
  const { papers, categories, isLoading, error } = usePapers();
  const paperState = useLocalPaperState();
  const theme = useTheme();
  const i18n = useI18n();
  const [enabledSlugs, setEnabledSlugs] = useState<string[]>([]);
  const [remotePapers, setRemotePapers] = useState(() => readRemotePaperCache());
  const [hasStorageError, setHasStorageError] = useState(() => storageFailures().length > 0);

  useEffect(() => {
    const update = () => setHasStorageError(storageFailures().length > 0);
    update();
    window.addEventListener('reader-storage-status', update);
    return () => window.removeEventListener('reader-storage-status', update);
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      setEnabledSlugs(readEnabledCategories(defaultEnabledCategories(categories)));
    }
  }, [categories]);

  const setEnabledCategories = (slugs: string[]) => {
    setEnabledSlugs(slugs);
    writeEnabledCategories(slugs);
  };

  useEffect(() => {
    const handleRemotePapers = () => setRemotePapers(readRemotePaperCache());
    window.addEventListener('remote-papers-updated', handleRemotePapers);
    return () => window.removeEventListener('remote-papers-updated', handleRemotePapers);
  }, []);

  const allPapers = useMemo(() => mergePapers([...papers, ...remotePapers]), [papers, remotePapers]);
  const papersRef = useRef(allPapers);
  papersRef.current = allPapers;
  const markViewed = useCallback((id: string) => {
    paperState.markViewed(id);
    const paper = papersRef.current.find((item) => item.id === id);
    if (paper) writeRemotePaperCache([paper]);
  }, [paperState.markViewed]);

  const pageProps = {
    papers: allPapers,
    categories,
    states: paperState.states,
    enabledSlugs,
    isLoading,
    onToggleSaved: (id: string) => {
      paperState.toggleSaved(id);
      const paper = allPapers.find((item) => item.id === id);
      if (paper) writeRemotePaperCache([paper]);
    },
    onMarkRead: paperState.markRead,
    onMarkViewed: markViewed,
    onSaveNote: paperState.saveNote,
    onRemoveHistory: paperState.removeFromHistory,
    onClearHistory: paperState.clearHistory,
    onSetEnabledSlugs: setEnabledCategories
  };

  return (
    <div className="min-h-[100dvh] bg-reader-bg text-reader-text">
      <Header onToggleTheme={theme.toggleTheme} />
      {hasStorageError ? <p role="alert" className="mx-auto max-w-7xl px-4 pt-4 text-sm">
        {i18n.language === 'ru'
          ? 'Не удалось сохранить изменения в браузере. Скопируйте важные заметки перед закрытием вкладки.'
          : 'Changes could not be saved in this browser. Copy important notes before closing the tab.'}
      </p> : null}
      {error ? (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-reader-border bg-reader-card p-4 text-sm text-reader-muted">{error}</div>
        </div>
      ) : null}
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Routes>
          <Route path="/" element={<Home {...pageProps} />} />
          <Route path="/explore" element={<Explore {...pageProps} />} />
          <Route path="/category/:slug" element={<CategoryPage {...pageProps} />} />
          <Route path="/paper/:id" element={<PaperPage {...pageProps} />} />
          <Route path="/search" element={<SearchPage {...pageProps} />} />
          <Route path="/saved" element={<Saved {...pageProps} />} />
          <Route path="/history" element={<History {...pageProps} />} />
          <Route
            path="/settings"
            element={
              <Settings
                {...pageProps}
                themePreference={theme.themePreference}
                onSetThemePreference={theme.setThemePreference}
                language={i18n.language}
                onSetLanguage={i18n.setLanguage}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.main>
    </div>
  );
}
