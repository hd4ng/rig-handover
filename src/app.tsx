import { Hono } from 'hono';
import { loadConfig, type RigConfig } from './config.js';
import { lane } from './lane.js';
import { readStatus } from './status.js';
import { readNight } from './digest/read.js';
import { Layout } from './views/layout.js';
import { StatusBoard } from './views/status.js';

const NIGHT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function createApp(config: RigConfig = loadConfig()) {
  const app = new Hono();

  app.get('/health', (c) => c.json({ ok: true, lane: lane().id }));

  app.get('/', (c) =>
    c.html(
      <Layout title="status" lane={lane()}>
        <StatusBoard status={readStatus(config)} />
      </Layout>,
    ),
  );

  app.get('/api/digest/:night', (c) => {
    const night = c.req.param('night');

    if (!NIGHT_PATTERN.test(night)) {
      return c.json({ error: 'no such night' }, 404);
    }

    const digest = readNight(config.runsDir, night);
    if (!digest) {
      return c.json({ error: 'no such night' }, 404);
    }

    return c.json(digest);
  });

  return app;
}
