import fs from 'fs';
import path from 'path';

/**
 * Remove the throwaway database once the run is over and both servers have
 * stopped, so the next run starts from the eight seeded books. Deleting it
 * any earlier pulls the file out from under a running API server.
 */
export default async function globalTeardown() {
  fs.rmSync(path.join(__dirname, '..', 'api', '.test-db'), { recursive: true, force: true });
}
