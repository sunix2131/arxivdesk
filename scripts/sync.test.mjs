import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildSnapshot, readJson, writeSnapshot } from './sync-arxiv.mjs';

const directories = [];
afterEach(async () => { for (const directory of directories.splice(0)) await rm(directory, { recursive: true }); });
const previous = { updatedAt: '2026-01-01', papers: [{ id: 'old', publishedAt: '2025-01-01', titleRu: 'Старое' }] };
const incoming = [{ id: 'new', publishedAt: '2026-09-01' }];
const cutoff = Date.parse('2026-08-01');

describe('snapshot updates', () => {
  it('rejects a complete upstream failure', () => {
    expect(() => buildSnapshot({ previous, incoming: [], cutoff, successes: 0, failures: 2 })).toThrow('not changed');
    expect(previous.papers).toHaveLength(1);
  });
  it('keeps old entries and the previous refresh date after a partial failure', () => {
    const result = buildSnapshot({ previous, incoming, cutoff, successes: 1, failures: 1 });
    expect(result.papers.map((paper) => paper.id)).toEqual(['new', 'old']);
    expect(result.updatedAt).toBe(previous.updatedAt);
  });
  it('prunes only after successful fetches and preserves translations on merge', () => {
    const result = buildSnapshot({ previous, incoming: [{ ...incoming[0], id: 'old' }], cutoff, successes: 1, failures: 0, now: 'today' });
    expect(result.papers[0].titleRu).toBe('Старое');
    expect(result.updatedAt).toBe('today');
    expect(buildSnapshot({ previous, incoming, cutoff, successes: 1, failures: 0 }).papers).toEqual(incoming);
  });
  it('does not treat malformed existing data as an empty database', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'arxivdesk-sync-'));
    directories.push(directory);
    const target = path.join(directory, 'papers.json');
    expect(await readJson(target, previous)).toEqual(previous);
    await writeFile(target, '{broken');
    await expect(readJson(target, previous)).rejects.toThrow();
    await writeSnapshot(target, previous);
    expect(JSON.parse(await readFile(target, 'utf8'))).toEqual(previous);
  });
});
