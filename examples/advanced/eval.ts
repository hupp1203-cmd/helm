/**
 * Eval — test agent behavior against expected outcomes.
 *
 * Run: npx tsx examples/advanced/eval.ts
 */

import { ScriptedProvider, AgentLoop, ToolRuntime } from '../../packages/runtime/dist/index.js';
import { JsonlJournal } from '../../packages/core/dist/index.js';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

interface TestCase {
  name: string;
  input: string;
  expectedPattern: RegExp;
}

const testCases: TestCase[] = [
  {
    name: 'greeting',
    input: 'Hello',
    expectedPattern: /hello|hi|greetings/i,
  },
  {
    name: 'farewell',
    input: 'Goodbye',
    expectedPattern: /bye|farewell|goodbye/i,
  },
];

async function runTest(testCase: TestCase): Promise<boolean> {
  const provider = new ScriptedProvider([
    { role: 'assistant', content: testCase.name === 'greeting' ? 'Hello there!' : 'Goodbye!' },
  ]);

  const toolRuntime = new ToolRuntime();
  const journalPath = join(mkdtempSync(join(tmpdir(), 'helm-')), 'run.jsonl');
  const journal = new JsonlJournal(journalPath);
  await journal.open();

  const loop = new AgentLoop(provider, toolRuntime, journal, { maxTurns: 5 });
  const result = await loop.run(`eval-${testCase.name}`, testCase.input);

  const lastMessage = result.messages[result.messages.length - 1];
  const content = lastMessage?.content ?? '';
  const passed = testCase.expectedPattern.test(content);

  await journal.close();

  return passed;
}

async function main() {
  console.log('Running eval suite...\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const result = await runTest(testCase);
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testCase.name}: "${testCase.input}"`);

    if (result) passed++;
    else failed++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

main().catch(console.error);
