import { describe, expect, it, afterEach } from 'vitest';
import { createApp } from '../src/app.js';
import { writeFileSync, rmSync } from 'fs';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('digest routes', () => {
  let tempDir: string;

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('GET /digest/:night returns 200 for a night with data', async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'digest-'));
    writeFileSync(
      join(tempDir, '2026-11-05.jsonl'),
      '{"at":"2026-11-05T23:00:02+01:00","job":"rig/rotate-logs","status":"ok","owner":"lane-07"}\n' +
      '{"at":"2026-11-05T23:00:06+01:00","job":"lane/sync","status":"ok","owner":"rook"}\n',
    );
    const config = { adapter: 'shim', installed: '2026-11-05T14:06:00+01:00', beatEverySeconds: 60, runsDir: tempDir };
    const res = await createApp(config).request('/digest/2026-11-05');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
  });

  it('GET /digest/:night returns 404 for a night with no file', async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'digest-'));
    const config = { adapter: 'shim', installed: '2026-11-05T14:06:00+01:00', beatEverySeconds: 60, runsDir: tempDir };
    const res = await createApp(config).request('/digest/2026-11-06');
    expect(res.status).toBe(404);
  });

  it('GET /api/digest/:night returns 200 for a night with data', async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'digest-'));
    writeFileSync(
      join(tempDir, '2026-11-05.jsonl'),
      '{"at":"2026-11-05T23:00:02+01:00","job":"rig/rotate-logs","status":"ok","owner":"lane-07"}\n' +
      '{"at":"2026-11-05T23:00:06+01:00","job":"lane/sync","status":"ok","owner":"rook"}\n',
    );
    const config = { adapter: 'shim', installed: '2026-11-05T14:06:00+01:00', beatEverySeconds: 60, runsDir: tempDir };
    const res = await createApp(config).request('/api/digest/2026-11-05');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('GET /api/digest/:night returns 404 for a night with no file', async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'digest-'));
    const config = { adapter: 'shim', installed: '2026-11-05T14:06:00+01:00', beatEverySeconds: 60, runsDir: tempDir };
    const res = await createApp(config).request('/api/digest/2026-11-06');
    expect(res.status).toBe(404);
  });

  it('GET /digest/:night renders "nothing ran" for an empty night', async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'digest-'));
    writeFileSync(join(tempDir, '2026-11-05.jsonl'), '');
    const config = { adapter: 'shim', installed: '2026-11-05T14:06:00+01:00', beatEverySeconds: 60, runsDir: tempDir };
    const res = await createApp(config).request('/digest/2026-11-05');
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('nothing ran');
  });

  it('GET /api/digest/:night returns empty rows for an empty night', async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'digest-'));
    writeFileSync(join(tempDir, '2026-11-05.jsonl'), '');
    const config = { adapter: 'shim', installed: '2026-11-05T14:06:00+01:00', beatEverySeconds: 60, runsDir: tempDir };
    const res = await createApp(config).request('/api/digest/2026-11-05');
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.rows).toEqual([]);
  });

  it('GET /digest/:night returns 200 for a night with a bad line', async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'digest-'));
    writeFileSync(
      join(tempDir, '2026-11-05.jsonl'),
      '{"at":"2026-11-05T23:00:02+01:00","job":"rig/rotate-logs","status":"ok","owner":"lane-07"}\n' +
      'not valid json\n' +
      '{"at":"2026-11-05T23:00:06+01:00","job":"lane/sync","status":"ok","owner":"rook"}\n',
    );
    const config = { adapter: 'shim', installed: '2026-11-05T14:06:00+01:00', beatEverySeconds: 60, runsDir: tempDir };
    const res = await createApp(config).request('/digest/2026-11-05');
    expect(res.status).toBe(200);
  });

  it('GET /api/digest/:night reports badLines count for a night with a bad line', async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'digest-'));
    writeFileSync(
      join(tempDir, '2026-11-05.jsonl'),
      '{"at":"2026-11-05T23:00:02+01:00","job":"rig/rotate-logs","status":"ok","owner":"lane-07"}\n' +
      'not valid json\n' +
      '{"at":"2026-11-05T23:00:06+01:00","job":"lane/sync","status":"ok","owner":"rook"}\n',
    );
    const config = { adapter: 'shim', installed: '2026-11-05T14:06:00+01:00', beatEverySeconds: 60, runsDir: tempDir };
    const res = await createApp(config).request('/api/digest/2026-11-05');
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.badLines).toBe(1);
    expect(body.rows.length).toBe(2);
  });

  it('GET /digest/:night and GET /api/digest/:night agree on job names and order', async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'digest-'));
    writeFileSync(
      join(tempDir, '2026-11-05.jsonl'),
      '{"at":"2026-11-05T23:00:02+01:00","job":"zebra/task","status":"ok","owner":"lane-07"}\n' +
      '{"at":"2026-11-05T23:00:06+01:00","job":"alpha/task","status":"ok","owner":"rook"}\n' +
      '{"at":"2026-11-05T23:00:10+01:00","job":"beta/task","status":"ok","owner":"rook"}\n',
    );
    const config = { adapter: 'shim', installed: '2026-11-05T14:06:00+01:00', beatEverySeconds: 60, runsDir: tempDir };

    const pageRes = await createApp(config).request('/digest/2026-11-05');
    const pageHtml = await pageRes.text();

    const jsonRes = await createApp(config).request('/api/digest/2026-11-05');
    const jsonBody = await jsonRes.json() as any;

    // Extract job names from JSON (should be sorted by job)
    const jsonJobs = jsonBody.rows.map((row: any) => row.job);
    expect(jsonJobs).toEqual(['alpha/task', 'beta/task', 'zebra/task']);

    // Verify page contains all job names in the same order
    const pageJobs = jsonJobs;
    for (const job of pageJobs) {
      expect(pageHtml).toContain(job);
    }

    // Verify order: alpha appears before beta, beta before zebra
    const alphaIdx = pageHtml.indexOf('alpha/task');
    const betaIdx = pageHtml.indexOf('beta/task');
    const zebraIdx = pageHtml.indexOf('zebra/task');
    expect(alphaIdx).toBeLessThan(betaIdx);
    expect(betaIdx).toBeLessThan(zebraIdx);
  });
});
