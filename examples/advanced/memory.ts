/**
 * Memory — cross-session persistent memory.
 *
 * Run: npx tsx examples/advanced/memory.ts
 */

import { MemoryStore } from '../../packages/memory/dist/index.js';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

async function main() {
  const tmpDir = join(tmpdir(), `helm-memory-demo-${Date.now()}`);
  const userDir = join(tmpDir, 'user');
  const projectDir = join(tmpDir, 'project');
  mkdirSync(userDir, { recursive: true });
  mkdirSync(projectDir, { recursive: true });

  // Create a project instruction file
  writeFileSync(
    join(projectDir, 'project.md'),
    `---
type: instruction
---

## Coding Style

- Use TypeScript strict mode
- Prefer const over let
- Always annotate return types
`,
    'utf-8',
  );

  // Create memory store
  const store = new MemoryStore({ userDir, projectDir });

  // Load memory
  const result = store.load();
  console.log('Loaded memory:');
  console.log('  Instructions:', result.instructions.length);
  console.log('  Auto:', result.auto.length);
  console.log('  Rules:', result.rules.length);

  // Get instruction text for system prompt
  const instructions = store.getInstructionText();
  console.log('\nInstruction text:');
  console.log(instructions);

  // Write auto-memory (simulating agent learning)
  store.writeAutoMemory({
    trigger: 'correction',
    content: 'User prefers Chinese comments in code',
  });

  // Reload and check
  const result2 = store.load();
  console.log('\nAfter writing auto-memory:');
  console.log('  Auto entries:', result2.auto.length);

  // Search
  const matches = store.search('TypeScript');
  console.log('\nSearch "TypeScript":', matches.length, 'match(es)');

  // Cleanup
  rmSync(tmpDir, { recursive: true, force: true });
}

main().catch(console.error);
