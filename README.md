# arXiv Reader

A research paper browser for arXiv with Russian translation support. Browse recent papers by category, search the database, save papers for later, and track your reading history — all with offline-first access.

## Features

- **Browse & Discover** — Explore papers across arXiv categories with a responsive grid or list layout
- **Search** — Full-text search across titles, abstracts, and authors
- **Save & Track** — Bookmark papers and maintain a reading history
- **Offline-First** — Papers are synced locally via `npm run sync`; no network required after sync
- **i18n** — English and Russian interface, with optional machine translation of titles and abstracts
- **Dark/Light Theme** — System-aware theme with manual toggle

## Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Framework   | React 18, TypeScript                            |
| Build       | Vite 6                                          |
| Styling     | TailwindCSS 3, PostCSS, Autoprefixer            |
| Animation   | Framer Motion                                   |
| Routing     | React Router DOM v6                             |
| Icons       | Lucide React                                    |
| Translation | @vitalets/google-translate-api                  |
| API         | arXiv API (export.arxiv.org), arXiv RSS fallback|
| Fonts       | @fontsource/inter                               |

## Quick Start

```bash
# Install dependencies
npm install

# Sync papers from arXiv (required first run)
npm run sync

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Scripts

| Script              | Description                                      |
|---------------------|--------------------------------------------------|
| `npm run dev`       | Start Vite dev server on port 5173               |
| `npm run build`     | Type-check and build for production              |
| `npm run preview`   | Preview production build                         |
| `npm run sync`      | Fetch papers from arXiv API into local JSON      |
| `npm run translate:ru` | Translate synced papers to Russian           |

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed. See the example file for all available options.

## Known Limitations

- `npm run sync` must be run before first use to populate the local paper database; the app shows an empty state otherwise
- No automated test suite
- No authentication or user accounts
- arXiv API may rate-limit; the sync script falls back to RSS feeds automatically
- `@vitejs/plugin-react` is in `dependencies` rather than `devDependencies`

## License

MIT
