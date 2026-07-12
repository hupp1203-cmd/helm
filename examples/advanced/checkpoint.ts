/**
 * Checkpoint — auto-snapshot and restore files.
 *
 * Run: npx tsx examples/advanced/checkpoint.ts
 */

import { CheckpointManager } from '../../packages/checkpoint/dist/index.js';
import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

async function main() {
  const tmpDir = join(tmpdir(), `helm-checkpoint-demo-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });

  const checkpointDir = join(tmpDir, 'checkpoints');
  const testFile = join(tmpDir, 'demo.ts');

  // Create initial file
  writeFileSync(testFile, 'const x = 1;', 'utf-8');
  console.log('Initial content:', readFileSync(testFile, 'utf-8'));

  const mgr = new CheckpointManager({
    sessionId: 'demo-session',
    checkpointDir,
  });

  // Create checkpoint (captures current file state)
  const cp1 = mgr.createFromFileEdit([testFile], 0, 'initial version');
  console.log('Created checkpoint:', cp1!.id);

  // Modify file
  writeFileSync(testFile, 'const x = 2;', 'utf-8');
  console.log('Modified content:', readFileSync(testFile, 'utf-8'));

  // Create another checkpoint
  const cp2 = mgr.createFromFileEdit([testFile], 1, 'updated x to 2');
  console.log('Created checkpoint:', cp2!.id);

  // List checkpoints
  console.log('\nCheckpoints:');
  for (const cp of mgr.list()) {
    console.log(`  ${cp.id} [${cp.type}] ${cp.description}`);
  }

  // Restore to first checkpoint
  const result = mgr.restore(cp1!.id, 'code');
  console.log('\nRestored to', cp1!.id);
  console.log('Files restored:', result!.filesRestored);
  console.log('Restored content:', readFileSync(testFile, 'utf-8'));

  // Cleanup
  rmSync(tmpDir, { recursive: true, force: true });
}

main().catch(console.error);
