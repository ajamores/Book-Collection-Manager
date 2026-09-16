import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * The app is two processes, so Playwright starts both: the Express API on
 * 4000 and the Next.js front end on 3000. The API is pointed at a throwaway
 * SQLite file so a run never touches api/database.db.
 *
 * The path is fixed and nothing is deleted here. Playwright evaluates this
 * config once per process -- the main process and every worker -- so any
 * fs.rmSync at module scope runs again inside the worker, after the main
 * process has already booted the API against that file. The server is left
 * holding a deleted inode: reads keep succeeding from the open handle while
 * every write fails with SQLITE_READONLY. Cleanup belongs in globalTeardown,
 * which runs once, after the servers are stopped.
 */
const TEST_DB = path.join(__dirname, 'api', '.test-db', 'test.db');
fs.mkdirSync(path.dirname(TEST_DB), { recursive: true });

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,          // one SQLite file, shared between specs
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  globalTeardown: './tests/global-teardown.ts',

  use: {
    baseURL: 'http://localhost:3000',
    video: 'on',                 // every run records; the README clip comes from here
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'api', testDir: './tests/api', use: { baseURL: 'http://localhost:4000' } },
    { name: 'e2e', testDir: './tests/e2e', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: [
    {
      command: 'node server.js',
      cwd: 'api',
      port: 4000,
      env: { DB_PATH: TEST_DB },
      // Always boot a fresh API so a run cannot inherit another database.
      reuseExistingServer: false,
      stdout: 'ignore',
    },
    {
      command: 'npm run dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'ignore',
    },
  ],
});
