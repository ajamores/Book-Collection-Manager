# Book Collection Manager

A small full-stack application for keeping a personal library: add books, rate them, filter them by genre, and delete them. The front end is Next.js 16 with the App Router; the data lives behind a separate Express API backed by SQLite.

Built as a course assignment for the Mohawk College Advanced Diploma in Computer Systems Technology (Software Development), January 2026. Published here as a portfolio piece.

![Adding, rating, deleting and filtering books](docs/demo.gif)

*Recorded by the Playwright suite. Every run captures video, so the clip above is a by-product of the tests rather than a staged demo.*

---

## Why it is built this way

The interesting part of this project is not the CRUD. It is that the front end and the data layer are two separate processes that have to agree with each other.

Next.js could have talked to SQLite directly from a route handler. Instead there is a standalone Express API on its own port, and the Next.js server fetches from it over HTTP. That means:

- **React Server Components do the reading.** `app/page.tsx` and the genre pages are `async` server components that `fetch` from the API and render the result. No client-side data fetching, no loading spinners, no `useEffect`.
- **Server Actions do the writing.** `components/actions.ts` is marked `'use server'`. Adding a book, changing a rating and deleting a book all run on the server, call the API, and then call `revalidatePath` so the affected pages re-render with fresh data.
- **Client components are only where they must be.** The form and the rating and delete buttons are client components because they need event handlers. Everything else stays on the server.

The trade-off is an extra network hop and an extra process to run. What it buys is a data layer that has no idea Next.js exists, and a front end that would work the same way against any HTTP API.

---

## Stack

| Layer | Technology |
|---|---|
| Front end | Next.js 16 (App Router), React 19, TypeScript 5 |
| Styling | CSS Modules, one stylesheet per component |
| API | Express 5, `cors` |
| Database | SQLite 3, via the `sqlite3` driver |
| Linting | ESLint 9 with `eslint-config-next` |

---

## Architecture

```
Browser
   │
   ▼
Next.js (port 3000)
   │  Server Components  ── fetch ──┐
   │  Server Actions     ── fetch ──┤
   │                                ▼
   │                      Express API (port 4000)
   │                                │
   │                                ▼
   │                        SQLite (api/database.db)
   ▼
Rendered HTML
```

Both processes must be running. The Next.js server is the only thing that talks to the API; the browser never calls port 4000 directly.

---

## Features

- **Add a book** — title, author and genre are required; year, pages and description are optional. New books start at a rating of 0.
- **Rate a book** — 0 to 5, validated on the server before it reaches the database.
- **Delete a book** — removes it and revalidates every page that showed it.
- **Browse by genre** — `/search` lists the five genres with a live count of books in each, and each one links to `/search/filter/[genre]`.
- **Static genre routes** — `generateStaticParams` pre-renders a page per genre at build time rather than resolving each one on demand.
- **Empty state** — an explicit message and prompt when the collection has no books, rather than a blank page.
- **Seed data** — eight books are inserted on first run so the app is not empty on a fresh clone.

---

## API

The Express server exposes five endpoints on port 4000.

| Method | Path | Purpose | Success | Failure |
|---|---|---|---|---|
| `GET` | `/books` | All books, newest first. Accepts `?genre=` | `200` | `500` |
| `GET` | `/books/:id` | One book | `200` | `404`, `500` |
| `POST` | `/books` | Create a book | `201` with the created row | `400` missing required field, `500` |
| `PUT` | `/books/:id/rating` | Update a rating | `200` | `400` rating outside 0–5, `404`, `500` |
| `DELETE` | `/books/:id` | Delete a book | `200` | `404`, `500` |

Every query is parameterised — values go in as `?` placeholders and are passed separately, never concatenated into the SQL string.

### Data model

```sql
CREATE TABLE IF NOT EXISTS books (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  author      TEXT NOT NULL,
  genre       TEXT NOT NULL,
  year        INTEGER,
  rating      REAL DEFAULT 0,
  pages       INTEGER,
  description TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

The `Book` interface in `app/types.ts` mirrors this table, and `GenreFilter` is a union type restricting genres to the five the app knows about.

---

## Running it locally

Requires Node.js 20 or newer. You will need two terminals, because the API and the front end are separate processes.

**Terminal 1 — the API:**

```bash
cd api
npm install
npm run dev          # nodemon, restarts on change
# or: npm start      # plain node
```

It listens on `http://localhost:4000` and prints its endpoints on startup. On first run it creates `api/database.db` and seeds it with eight books.

**Terminal 2 — the front end:**

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

---

## Project layout

```
app/
  page.tsx                          home: add form + full book list
  layout.tsx                        shared shell and nav
  types.ts                          Book interface, GenreFilter union
  search/page.tsx                   genre index with per-genre counts
  search/filter/[genre]/page.tsx    dynamic genre route
components/
  actions.ts                        'use server' — create, rate, delete
  BookForm.tsx                      client component, add form
  BookItem.tsx                      one book card
  BookActions.tsx                   client component, rate and delete
  HeaderNav.tsx                     navigation
api/
  server.js                         Express routes
  db.js                             SQLite connection, schema, seed data
```

---

## Tests

Playwright covers both halves of the app: the API directly, and the UI through a real browser.

```bash
npx playwright install chromium   # once
npm test                          # 35 tests
npm run test:ui                   # watch them run
npm run test:report               # open the HTML report
```

Playwright starts both servers itself, so nothing needs to be running first. The API is pointed at a throwaway SQLite file, so a test run never touches `api/database.db`.

| Project | Count | Covers |
|---|---|---|
| `api` | 20 | The five endpoints: status codes, validation, 404s, rating boundaries at `-1`, `0`, `3`, `5` and `6` |
| `e2e` | 15 | Add, rate, delete and filter through the browser, plus the form's client-side validation |

Two things worth pointing out:

**A known bug is recorded as a test, not a comment.** `GET /books` accepts `minRating` and silently ignores it. Rather than describe that in prose, the suite asserts the behaviour the endpoint *should* have and marks it `test.fail()`. The run stays green while the bug is on the record, and the moment somebody fixes it the test starts passing and Playwright flags it as an unexpected pass. The bug cannot be quietly forgotten or quietly fixed.

**Scoping to one book without adding test ids.** Next.js compiles CSS Modules to class names like `bookitem_bookCard__a1b2c3`, so `[class*="bookCard"]` filtered by the card's heading reaches a single book card without touching the components to add `data-testid` attributes.

---

## Known limitations

Written down deliberately. These are the things I would fix before calling it finished:

- **The API URL is hardcoded.** `http://localhost:4000` appears in four front-end files. It belongs in an environment variable, which is also what would be needed to deploy it anywhere.
- **`/books` accepts filters it ignores.** The route destructures `year`, `minRating` and `search` from the query string, but only `genre` is ever used to build the `WHERE` clause. The other three are dead parameters — a caller passing `?minRating=4` gets every book back and no indication that the filter was dropped. Either wire them up or stop accepting them. Covered by an expected-failure test, so fixing it will make the suite tell you.
- **`api/database.db` is committed.** `db.js` recreates and seeds the database on first run, so the checked-in file is redundant and will drift from whatever is in the repo.
- **No validation beyond the required fields.** `year` and `pages` are parsed with `parseInt` and stored without a sanity check; a book published in the year 50000 with -3 pages is accepted.
- **Errors are logged, not surfaced.** If the API is down, the server components catch the failure, log to the console and render an empty collection. The user sees "no books" rather than "could not reach the server", which are very different problems.
- **No authentication.** Anyone who can reach the API can modify the collection. Fine for a single-user local app, not fine for anything else.
