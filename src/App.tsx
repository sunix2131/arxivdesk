import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from './components/Header';
import { useLocalPaperState } from './hooks/useLocalPaperState';
import { usePapers } from './hooks/usePapers';
import { useTheme } from './hooks/useTheme';
import { defaultEnabledCategories } from './lib/categories';
import { useI18n } from './lib/i18n';
import { mergePapers, readRemotePaperCache } from './lib/arxivRemote';
import { readEnabledCategories, writeEnabledCategories } from './lib/storage';
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

  const allPapers = mergePapers([...papers, ...remotePapers]);

  const pageProps = {
    papers: allPapers,
    categories,
    states: paperState.states,
    enabledSlugs,
    isLoading,
    onToggleSaved: paperState.toggleSaved,
    onMarkRead: paperState.markRead,
    onMarkViewed: paperState.markViewed,
    onSaveNote: paperState.saveNote,
    onRemoveHistory: paperState.removeFromHistory,
    onClearHistory: paperState.clearHistory,
    onSetEnabledSlugs: setEnabledCategories
  };

  return (
    <div className="min-h-[100dvh] bg-reader-bg text-reader-text">
      <Header onToggleTheme={theme.toggleTheme} />
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
