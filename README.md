# arXiv Reader

A local-first reader for browsing arXiv papers. It keeps the paper index in a JSON snapshot and stores saved papers, notes and reading history in the browser.

The repository does not contain a prebuilt research database. Run the sync command once before opening the app.

## Run locally

Requires Node.js 22 or newer.

```bash
npm ci
cp .env.example .env
npm run sync
npm run dev
```

Vite serves the app at `http://localhost:5173` and proxies live searches to the arXiv API. The initial sync covers the previous 90 days by default. It can take a while because requests are deliberately spaced out.

## What is implemented

- local search across titles, abstracts, authors, categories and translated text;
- category and date filters;
- saved papers, notes and reading history in `localStorage`;
- English and Russian interface;
- optional Russian translation of the synced title and abstract;
- live arXiv search with debouncing, pagination and stale-request cancellation;
- light, dark and system themes.

There are no accounts or server-side user records. Clearing the browser storage removes the reading state.

## Updating the paper snapshot

`npm run sync` reads `public/data/categories.json`, downloads matching entries and writes `public/data/papers.json`. Existing translations are retained when an entry is refreshed.

The defaults can be changed in `.env`:

```dotenv
ARXIV_DAYS_TO_KEEP=30
ARXIV_MAX_RESULTS=1000
ARXIV_CATEGORY_SLUGS=ai,statistics
```

`ARXIV_CATEGORY_SLUGS` contains slugs from `public/data/categories.json`. `ARXIV_QUERIES` can be used instead when exact arXiv category expressions are needed.

Translation is a separate, resumable step:

```bash
TRANSLATE_LIMIT=20 npm run translate:ru
```

The translation script uses the unofficial `@vitalets/google-translate-api` package. It may be rate-limited or stop working when the upstream service changes; papers without a translation remain readable in English.

## Live search outside local development

The development server provides `/arxiv-api` as a same-origin proxy. A static host needs an equivalent endpoint. Set `VITE_ARXIV_API_URL` at build time if the endpoint has another path:

```dotenv
VITE_ARXIV_API_URL=/api/arxiv
```

The browser does not fall back to a public CORS proxy. If the configured endpoint is unavailable, local search continues to work and the remote error is shown in the search page.

## Checks

```bash
npm test
npm run build
```

The tests cover filters, date boundaries, arXiv ID queries, free-text query construction and cache merging. Browser-level tests are not included yet.

## Current limits

- synced papers are stored as one JSON file and loaded in full;
- reading state is local to one browser profile;
- the sync parser expects the current arXiv Atom and RSS formats;
- translation has no provider guarantee;
- a deployed live search needs a same-origin proxy.
