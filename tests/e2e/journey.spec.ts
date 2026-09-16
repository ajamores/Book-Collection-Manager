import { test, expect, Page } from '@playwright/test';

/**
 * One continuous walkthrough of the whole app, in the order a person would
 * actually use it. It duplicates coverage the focused specs already have, but
 * it is the test that proves the pieces work together -- and because Playwright
 * records every run, it doubles as the demo clip in the README. That is why it
 * uses a real book rather than a generated title.
 */
const TITLE = 'Dune';

const card = (page: Page, title: string) =>
  page.locator('[class*="bookCard"]').filter({ has: page.getByRole('heading', { name: title, exact: true }) });

test('a reader adds a book, rates it, finds it by genre and removes it', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Book Collection', exact: true })).toBeVisible();

  // Add it.
  await page.fill('#title', TITLE);
  await page.fill('#author', 'Frank Herbert');
  await page.selectOption('#genre', 'sci-fi');
  await page.fill('#year', '1965');
  await page.fill('#pages', '412');
  await page.fill('#description', 'A desert planet, a noble house in exile, and the empire that depends on its spice.');
  await page.getByRole('button', { name: 'Add Book' }).click();

  const dune = card(page, TITLE);
  await expect(dune).toBeVisible();
  await expect(dune.getByText('Frank Herbert')).toBeVisible();
  await expect(dune.getByText('0.0/5')).toBeVisible();

  // Rate it.
  await dune.getByRole('button', { name: '5 ★' }).click();
  await expect(dune.getByText('5.0/5')).toBeVisible();

  // Find it under its genre.
  await page.getByRole('link', { name: 'Search Books' }).click();
  await expect(page.getByRole('heading', { name: 'Filter Books' })).toBeVisible();
  await page.getByRole('heading', { name: 'Sci-Fi', exact: true }).click();

  await expect(card(page, TITLE)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Great Gatsby' })).toHaveCount(0);

  // Remove it, confirming first.
  await page.getByRole('link', { name: 'Home' }).click();

  // HeaderNav uses a plain <a href="/"> rather than next/link, so this is a
  // full document load. The delete button is in the server-rendered HTML
  // straight away, but it belongs to a client component -- clicking it before
  // React has hydrated does nothing, because the handler is not attached yet.
  // Retry the click until the confirmation actually appears.
  const deleteButton = card(page, TITLE).getByRole('button', { name: 'Delete Book' });
  await expect(async () => {
    await deleteButton.click();
    await expect(page.getByText(`Delete "${TITLE}"?`)).toBeVisible({ timeout: 1000 });
  }).toPass();

  await page.getByRole('button', { name: 'Yes, Delete' }).click();

  await expect(card(page, TITLE)).toHaveCount(0);
});
