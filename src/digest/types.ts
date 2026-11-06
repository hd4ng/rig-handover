// Plan morning-digest § 1. The contract every part of § 2 builds against.
export type RunStatus = 'ok' | 'retry' | 'fail';

// One job's night, folded from its lines in runs/<night>.jsonl.
export type DigestRow = {
  job: string;
  owner: string | null;
  runs: number;
  retries: number;
  lastStatus: RunStatus;
  lastError: string | null;
  // Times as written in the log, offset kept (styleguide: never convert to UTC).
  firstAt: string;
  lastAt: string;
};

export type Night = {
  night: string;
  // Sorted by job.
  rows: DigestRow[];
  // Lines that did not parse; counted, never thrown.
  badLines: number;
  // Parsed lines by status, for the board (§ 2c).
  counts: Record<RunStatus, number>;
};

// Returns null when runs/<night>.jsonl does not exist.
// Implemented in src/digest/read.ts as `export const readNight: ReadNight`.
export type ReadNight = (runsDir: string, night: string) => Night | null;
