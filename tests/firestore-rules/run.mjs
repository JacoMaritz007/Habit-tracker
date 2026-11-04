// Runs every *.test.mjs suite in this folder and fails if any check fails.
import { readdirSync } from 'fs';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
const dir = fileURLToPath(new URL('.', import.meta.url));
let failed = 0, passed = 0;
for (const f of readdirSync(dir).filter(f => f.endsWith('.test.mjs')).sort()) {
  const r = spawnSync(process.execPath, [f], { cwd: dir, encoding: 'utf8' });
  const lines = (r.stdout || '').split('\n').filter(l => /^(PASS|FAIL)/.test(l));
  passed += lines.filter(l => l.startsWith('PASS')).length;
  const fails = lines.filter(l => l.startsWith('FAIL'));
  failed += fails.length + (r.status ? 1 : 0);
  console.log(`${f}: ${lines.length - fails.length}/${lines.length} passed`);
  fails.forEach(l => console.log('  ' + l));
  if (r.status) console.log((r.stderr || '').split('\n').slice(-5).join('\n'));
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
