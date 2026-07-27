import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { translate } from '@vitalets/google-translate-api';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const papersPath = path.join(root, 'public', 'data', 'papers.json');
const LIMIT = Number(process.env.TRANSLATE_LIMIT || Number.POSITIVE_INFINITY);
const DELAY_MS = Number(process.env.TRANSLATE_DELAY_MS || 700);
const FORCE = process.env.TRANSLATE_FORCE === '1';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const compact = (value) => value.replace(/\s+/g, ' ').trim();

const translateText = async (text) => {
  const result = await translate(text, { from: 'en', to: 'ru' });
  return compact(result.text || '');
};

const translatePaper = async (paper) => {
  const next = { ...paper };

  if (FORCE || !next.titleRu) {
    next.titleRu = await translateText(next.title);
    await delay(DELAY_MS);
  }

  if (FORCE || !next.abstractRu) {
    next.abstractRu = await translateText(next.abstract);
    await delay(DELAY_MS);
  }

  return next;
};

const run = async () => {
  const payload = JSON.parse(await readFile(papersPath, 'utf8'));
  let translated = 0;

  for (let index = 0; index < payload.papers.length; index += 1) {
    const paper = payload.papers[index];
    const needsTranslation = FORCE || !paper.titleRu || !paper.abstractRu;
    if (!needsTranslation) continue;
    if (translated >= LIMIT) break;

    try {
      payload.papers[index] = await translatePaper(paper);
      translated += 1;
      console.log(`${translated}. ${paper.id} translated`);

      if (translated % 10 === 0) {
        await writeFile(papersPath, `${JSON.stringify(payload)}\n`);
      }
    } catch (error) {
      console.warn(`${paper.id} skipped: ${error.message}`);
      await delay(DELAY_MS * 5);
    }
  }

  await writeFile(papersPath, `${JSON.stringify({ ...payload, translatedRuAt: new Date().toISOString() })}\n`);
  console.log(`Translated ${translated} papers. Saved ${path.relative(root, papersPath)}`);
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
