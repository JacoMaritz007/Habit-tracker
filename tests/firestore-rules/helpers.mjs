// Shared setup for the rules suites. The emulator host comes from
// FIRESTORE_EMULATOR_HOST, which `firebase emulators:exec` sets.
import { readFileSync } from 'fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';

export async function setup(projectId) {
  return initializeTestEnvironment({
    projectId,
    firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8') },
  });
}

export function checker() {
  const results = [];
  const check = async (name, expect, fn) => {
    try {
      await (expect === 'allow' ? assertSucceeds(fn()) : assertFails(fn()));
      results.push(['PASS', name]);
    } catch (e) {
      results.push(['FAIL', `${name}  (expected ${expect})  ${e.message?.split('\n')[0]}`]);
    }
  };
  const report = () => results.forEach(([s, n]) => console.log(`${s}  ${n}`));
  return { check, report, results };
}
