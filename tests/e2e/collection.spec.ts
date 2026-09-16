import { test, expect, Page } from '@playwright/test';

/**
 * Browser tests against the Next.js front end on port 3000.
 *
 * Next.js CSS Modules compile to class names of the form
 * `bookitem_bookCard__a1b2c3`, so a substring match on the original name is a
 * stable way to scope to one card without adding test ids to the components.
 */
const card = (page: Page, title: string) =>
  page.locator('[class*="bookCard"]').filter({ has: page.getByRole('heading', { name: title, exact: true }) });

const uniqueTitle = () => `E2E Book ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

async function addBook(page: Page, title: string, genre = 'fiction') {
  await page.fill('#title', title);
  await page.fill('#author', 'Test Author');
  await page.selectOption('#genre', genre);
  await page.getByRole('button', { name: 'Add Book' }).click();
  await expect(card(page, title)).toBeVisible();
}

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => await page.goto('/'));

  test('renders the collection and the add form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Book Collection', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /All Books \(\d+\)/ })).toBeVisible();
    await expect(page.locator('#title')).toBeVisible();
  });

  test('shows the seeded books', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'The Great Gatsby' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '1984' })).toBeVisible();
  });
});

test.describe('Adding a book', () => {
  test.beforeEach(async ({ page }) => await page.goto('/'));

  test('a new book appears in the collection', async ({ page }) => {
    const title = uniqueTitle();
    await addBook(page, title, 'fantasy');

    const item = card(page, title);
    await expect(item.getByText('Test Author')).toBeVisible();
    await expect(item.getByText('fantasy', { exact: true })).toBeVisible();
  });

  test('the form clears after a successful submit', async ({ page }) => {
    await addBook(page, uniqueTitle());
    await expect(page.locator('#title')).toHaveValue('');
    await expect(page.locator('#author')).toHaveValue('');
  });

  // The form validates in the browser before the Server Action is called.
  test('rejects an author containing digits', async ({ page }) => {
    await page.fill('#title', uniqueTitle());
    await page.fill('#author', 'Isaac Asimov 3000');
    await page.getByRole('button', { name: 'Add Book' }).click();

    await expect(page.getByText('Please fix the following errors:')).toBeVisible();
    await expect(page.getByText('Author name cannot contain digits.')).toBeVisible();
  });

  test('rejects a one-character title', async ({ page }) => {
    await page.fill('#title', 'X');
    await page.fill('#author', 'Test Author');
    await page.getByRole('button', { name: 'Add Book' }).click();

    await expect(page.getByText('Title must be at least 2 characters long.')).toBeVisible();
  });

  test('rejects a year in the future', async ({ page }) => {
    await page.fill('#title', uniqueTitle());
    await page.fill('#author', 'Test Author');
    await page.fill('#year', String(new Date().getFullYear() + 1));
    await page.getByRole('button', { name: 'Add Book' }).click();

    await expect(page.getByText(/Year must be between 1000 and/)).toBeVisible();
  });

  test('rejects a negative page count', async ({ page }) => {
    await page.fill('#title', uniqueTitle());
    await page.fill('#author', 'Test Author');
    await page.fill('#pages', '-5');
    await page.getByRole('button', { name: 'Add Book' }).click();

    await expect(page.getByText('Pages must be a positive number.')).toBeVisible();
  });
});

test.describe('Rating a book', () => {
  test('clicking a star updates the displayed rating', async ({ page }) => {
    await page.goto('/');
    const title = uniqueTitle();
    await addBook(page, title);

    const item = card(page, title);
    await expect(item.getByText('0.0/5')).toBeVisible();   // new books start unrated

    await item.getByRole('button', { name: '4 ★' }).click();
    await expect(item.getByText('4.0/5')).toBeVisible();
  });

  test('the rating survives a reload', async ({ page }) => {
    await page.goto('/');
    const title = uniqueTitle();
    await addBook(page, title);

    await card(page, title).getByRole('button', { name: '2 ★' }).click();
    await expect(card(page, title).getByText('2.0/5')).toBeVisible();

    await page.reload();
    await expect(card(page, title).getByText('2.0/5')).toBeVisible();
  });
});

test.describe('Deleting a book', () => {
  test('cancelling the confirmation keeps the book', async ({ page }) => {
    await page.goto('/');
    const title = uniqueTitle();
    await addBook(page, title);

    const item = card(page, title);
    await item.getByRole('button', { name: 'Delete Book' }).click();
    await expect(item.getByText(`Delete "${title}"?`)).toBeVisible();

    await item.getByRole('button', { name: 'Cancel' }).click();
    await expect(item).toBeVisible();
  });

  test('confirming removes the book from the collection', async ({ page }) => {
    await page.goto('/');
    const title = uniqueTitle();
    await addBook(page, title);

    const item = card(page, title);
    await item.getByRole('button', { name: 'Delete Book' }).click();
    await item.getByRole('button', { name: 'Yes, Delete' }).click();

    await expect(card(page, title)).toHaveCount(0);
  });
});

test.describe('Browsing by genre', () => {
  test('the genre index lists all five genres', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByRole('heading', { name: 'Filter Books' })).toBeVisible();

    for (const genre of ['Fiction', 'Sci-Fi', 'Fantasy', 'Mystery', 'Non-Fiction']) {
      await expect(page.getByRole('heading', { name: genre, exact: true })).toBeVisible();
    }
  });

  test('a genre page shows only books of that genre', async ({ page }) => {
    await page.goto('/search/filter/sci-fi');

    await expect(page.getByRole('heading', { name: '1984' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Great Gatsby' })).toHaveCount(0);
  });

  test('an unknown genre shows the not-found message', async ({ page }) => {
    await page.goto('/search/filter/biography');

    await expect(page.getByText(/Genre not found/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go back to home' })).toBeVisible();
  });
});
