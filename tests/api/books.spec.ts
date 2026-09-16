import { test, expect } from '@playwright/test';

/**
 * API tests against the Express server on port 4000.
 * No browser involved: these hit the endpoints directly.
 */

// Unique title per run so repeated runs never collide on seeded data.
const uniqueTitle = () => `Test Book ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

async function createBook(request: any, overrides: Record<string, unknown> = {}) {
  const res = await request.post('/books', {
    data: { title: uniqueTitle(), author: 'Test Author', genre: 'fiction', ...overrides },
  });
  return { res, body: await res.json() };
}

test.describe('GET /books', () => {
  test('returns the seeded collection', async ({ request }) => {
    const res = await request.get('/books');
    expect(res.status()).toBe(200);

    const books = await res.json();
    expect(Array.isArray(books)).toBe(true);
    expect(books.length).toBeGreaterThanOrEqual(8);
    expect(books[0]).toHaveProperty('title');
    expect(books[0]).toHaveProperty('genre');
  });

  test('filters by genre', async ({ request }) => {
    const res = await request.get('/books?genre=sci-fi');
    expect(res.status()).toBe(200);

    const books = await res.json();
    expect(books.length).toBeGreaterThan(0);
    expect(books.every((b: any) => b.genre === 'sci-fi')).toBe(true);
  });

  test('genre=all is treated as no filter', async ({ request }) => {
    const all = await (await request.get('/books?genre=all')).json();
    const none = await (await request.get('/books')).json();
    expect(all.length).toBe(none.length);
  });

  test('returns newest first', async ({ request }) => {
    const { body: created } = await createBook(request);
    const books = await (await request.get('/books')).json();
    expect(books[0].id).toBe(created.id);
  });

  // KNOWN BUG, documented in the README.
  // The route destructures year, minRating and search from the query string
  // but only genre reaches the WHERE clause. A caller filtering on minRating
  // silently gets everything back. Marked as an expected failure so the suite
  // stays green while the bug is on the record -- it will flag the moment
  // someone fixes it and this test starts passing.
  test.fail('minRating is accepted but ignored', async ({ request }) => {
    const res = await request.get('/books?minRating=5');
    const books = await res.json();
    expect(books.every((b: any) => b.rating >= 5)).toBe(true);
  });
});

test.describe('GET /books/:id', () => {
  test('returns a single book', async ({ request }) => {
    const { body: created } = await createBook(request);

    const res = await request.get(`/books/${created.id}`);
    expect(res.status()).toBe(200);
    expect((await res.json()).id).toBe(created.id);
  });

  test('404s for an id that does not exist', async ({ request }) => {
    const res = await request.get('/books/999999');
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toBe('Book not found');
  });
});

test.describe('POST /books', () => {
  test('creates a book and returns it with an id', async ({ request }) => {
    const title = uniqueTitle();
    const res = await request.post('/books', {
      data: { title, author: 'Ursula K. Le Guin', genre: 'sci-fi', year: 1969, pages: 304 },
    });

    expect(res.status()).toBe(201);
    const book = await res.json();
    expect(book.id).toBeTruthy();
    expect(book.title).toBe(title);
    expect(book.rating).toBe(0);      // new books start unrated
  });

  for (const missing of ['title', 'author', 'genre']) {
    test(`400s when ${missing} is missing`, async ({ request }) => {
      const data: Record<string, unknown> = {
        title: uniqueTitle(), author: 'Test Author', genre: 'fiction',
      };
      delete data[missing];

      const res = await request.post('/books', { data });
      expect(res.status()).toBe(400);
      expect((await res.json()).error).toContain('required');
    });
  }
});

test.describe('PUT /books/:id/rating', () => {
  // The boundary cases the README calls out as the obvious first tests.
  for (const rating of [0, 3, 5]) {
    test(`accepts a rating of ${rating}`, async ({ request }) => {
      const { body: created } = await createBook(request);

      const res = await request.put(`/books/${created.id}/rating`, { data: { rating } });
      expect(res.status()).toBe(200);

      const book = await (await request.get(`/books/${created.id}`)).json();
      expect(book.rating).toBe(rating);
    });
  }

  for (const rating of [-1, 6]) {
    test(`rejects a rating of ${rating}`, async ({ request }) => {
      const { body: created } = await createBook(request);

      const res = await request.put(`/books/${created.id}/rating`, { data: { rating } });
      expect(res.status()).toBe(400);
      expect((await res.json()).error).toContain('between 0 and 5');
    });
  }

  test('rejects a missing rating', async ({ request }) => {
    const { body: created } = await createBook(request);
    const res = await request.put(`/books/${created.id}/rating`, { data: {} });
    expect(res.status()).toBe(400);
  });

  test('404s for a book that does not exist', async ({ request }) => {
    const res = await request.put('/books/999999/rating', { data: { rating: 3 } });
    expect(res.status()).toBe(404);
  });
});

test.describe('DELETE /books/:id', () => {
  test('deletes a book and it stops being retrievable', async ({ request }) => {
    const { body: created } = await createBook(request);

    const del = await request.delete(`/books/${created.id}`);
    expect(del.status()).toBe(200);

    const after = await request.get(`/books/${created.id}`);
    expect(after.status()).toBe(404);
  });

  test('404s when deleting the same book twice', async ({ request }) => {
    const { body: created } = await createBook(request);
    await request.delete(`/books/${created.id}`);

    const second = await request.delete(`/books/${created.id}`);
    expect(second.status()).toBe(404);
  });
});
