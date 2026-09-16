# Build log — Playwright suite

The honest record of who did what, kept so that nothing here gets described as
something it was not. Same convention as `ajamores/erpnext-lead-intake`.

**Date:** 15 September 2026

---

## What Claude Code wrote

All of it, from a spec I gave it in conversation:

- `playwright.config.ts` — two `webServer` entries, `video: 'on'`, `trace: 'on-first-retry'`
- `tests/global-teardown.ts`
- `tests/api/books.spec.ts` — 20 tests
- `tests/e2e/collection.spec.ts` — 15 tests
- The `DB_PATH` change in `api/db.js`
- The README's Tests section
- The demo GIF, converted with ffmpeg from the recorded run

I did not write these tests and I have not yet reviewed them line by line.
**Do not describe this as Playwright experience until the "What I did myself"
section below says otherwise.** On a CV this is `Playwright (personal
project)` at most, in the same way Selenium WebDriver is labelled on Stock
Diary.

---

## The bug worth talking about

The first run had 7 of 20 API tests failing. Every read passed; every write
came back `500`. Running the same requests by hand against the same server
worked every time, which is the sort of gap that usually means the test
harness is at fault rather than the application.

The response body gave it away:

```
SQLITE_READONLY: attempt to write a readonly database
```

The cause was in the Playwright config, not the app. The config deleted the
throwaway database at module scope, to give each run a clean slate:

```ts
fs.rmSync(TEST_DB_DIR, { recursive: true, force: true });
fs.mkdirSync(TEST_DB_DIR, { recursive: true });
```

**Playwright evaluates the config file once per process** — the main process
and every worker. The main process created the directory and booted the API
against a file inside it. The worker then started, re-evaluated the same
config, and deleted that directory out from under the running server. The
server was left holding a deleted inode: it kept serving reads from its open
file handle, and every write failed.

The fix was to stop deleting anything at module scope and move cleanup into
`globalTeardown`, which runs once, after the servers have stopped.

Two things worth remembering from it:

1. A test failure is not automatically a product defect. This one was entirely
   my own harness, and the giveaway was that manual requests succeeded.
2. Reading the response body would have taken thirty seconds and saved three
   wrong theories. I guessed at causes before looking at what the server
   actually said.

---

## Deliberate choices

- **`test.fail()` for the `minRating` bug.** `GET /books` accepts `minRating`
  and ignores it. The test asserts the correct behaviour and is marked as an
  expected failure, so the suite stays green while the defect stays on the
  record — and Playwright reports an unexpected pass the moment it is fixed.
- **No `data-testid` attributes.** Next.js CSS Modules produce class names
  like `bookitem_bookCard__a1b2c3`, so `[class*="bookCard"]` scopes to a card
  without modifying the components under test.
- **`workers: 1`, `fullyParallel: false`.** One SQLite file shared across the
  specs. Tests use unique titles and relative assertions rather than exact
  counts, so they tolerate leftover state, but parallel writes to one SQLite
  file are not worth the trouble here.
- **Separate `api` and `e2e` projects.** The API tests need no browser and
  finish in about ten seconds; keeping them apart means they can be run alone.

---

## What I did myself

*Nothing yet. To be filled in — and this section is the thing that decides
what I am allowed to claim.*

- [ ] Run the suite start to finish and watch it in `--ui` mode
- [ ] Read `playwright.config.ts` and be able to explain the two `webServer`
      entries and why cleanup sits in `globalTeardown`
- [ ] Break a test deliberately and read the trace in the trace viewer
- [ ] Write at least one test from scratch, unaided
- [ ] Fix the `minRating` bug and confirm the `test.fail()` flips to an
      unexpected pass
- [ ] Add tests for the two limitations still on the list: the unsurfaced
      API-down error state, and `year`/`pages` accepting nonsense values
