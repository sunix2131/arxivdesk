import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Paper } from '../types';

const cacheKey = 'research-reader:remote-papers:v1';
const stateKey = 'research-reader:user-paper-state:v1';
let values: Map<string, string>;

const paper = (id: string): Paper => ({
  id, title: id, abstract: 'Abstract', authors: ['Author'], categories: ['cs.AI'],
  primaryCategory: 'cs.AI', publishedAt: '2026-09-01', updatedAt: '2026-09-01',
  arxivUrl: `https://arxiv.org/abs/${id}`, pdfUrl: `https://arxiv.org/pdf/${id}`
});

beforeEach(() => {
  vi.resetModules();
  values = new Map();
  vi.stubGlobal('window', {
    localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) },
    sessionStorage: { getItem: () => null },
    dispatchEvent: vi.fn()
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('reading data', () => {
  it('rejects valid JSON with the wrong storage shape', async () => {
    const storage = await import('./storage');
    for (const value of ['null', '[]', '42', '{"bad":null}']) {
      values.set(stateKey, value);
      expect(storage.readUserStates()).toEqual({});
    }
    values.set(stateKey, JSON.stringify({ p: { isSaved: true, isRead: false, note: 'Keep me', viewedAt: 'invalid' } }));
    expect(storage.readUserStates()).toEqual({ p: { paperId: 'p', isSaved: true, isRead: false, note: 'Keep me' } });
  });

  it('survives blocked storage and reports unsaved changes', async () => {
    Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('blocked'); } });
    const storage = await import('./storage');
    expect(storage.readThemePreference()).toBe('light');
    expect(storage.readLanguage()).toBe('en');
    expect(storage.writeUserStates({})).toBe(false);
    expect(storage.storageFailures()).toContain(stateKey);
  });

  it('keeps a remote paper after a new browser session', async () => {
    (await import('./arxivRemote')).writeRemotePaperCache([paper('saved')]);
    expect(values.has(cacheKey)).toBe(true);
    vi.resetModules();
    expect((await import('./arxivRemote')).readRemotePaperCache().map((item) => item.id)).toEqual(['saved']);
  });

  it('retains tracked papers while evicting the oldest untracked results', async () => {
    values.set(stateKey, JSON.stringify({ saved: { isSaved: true, isRead: false } }));
    const cache = await import('./arxivRemote');
    cache.writeRemotePaperCache([paper('saved'), paper('old')]);
    cache.writeRemotePaperCache(Array.from({ length: 501 }, (_, index) => paper(`new-${index}`)));
    const ids = cache.readRemotePaperCache().map((item) => item.id);
    expect(ids).toHaveLength(501);
    expect(ids).toContain('saved');
    expect(ids).toContain('new-500');
    expect(ids).not.toContain('old');
    expect(ids).not.toContain('new-0');
  });
});
