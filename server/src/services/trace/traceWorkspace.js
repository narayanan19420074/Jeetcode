import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { RUN_AS } from '../localJudge.service.js';

// Temporary directory for one trace. When the judge runs as root, only the unprivileged run-as user may read it,
// exactly like the workspaces of normal runs.
export function createTraceWorkspace(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jc-trace-'));
  if (RUN_AS) {
    fs.chmodSync(dir, 0o700);
    fs.chownSync(dir, RUN_AS.uid, RUN_AS.gid);
  }
  Object.entries(files).forEach(([name, content]) => {
    const file = path.join(dir, name);
    fs.writeFileSync(file, content);
    if (RUN_AS) fs.chownSync(file, RUN_AS.uid, RUN_AS.gid);
  });
  return dir;
}

export function removeTraceWorkspace(dir) {
  fs.rm(dir, { recursive: true, force: true }, () => {});
}
