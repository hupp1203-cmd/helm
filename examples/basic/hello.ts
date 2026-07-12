/**
 * Basic Hello World — simplest possible Helm agent.
 *
 * Run: npx tsx examples/basic/hello.ts
 */

import { AgentLoop, ToolRuntime, ScriptedProvider } from '../../packages/runtime/dist/index.js';
import { JsonlJournal } from '../../packages/core/dist/index.js';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

async function main() {
  // Create a provider that always says "Hello!"
  const provider = new ScriptedProvider([
    { role: 'assistant', content: 'Hello! I am Helm, your AI agent harness.' },
  ]);

  // No tools needed for this example
  const toolRuntime = new ToolRuntime();

  // Journal records all events
  const journalPath = join(mkdtempSync(join(tmpdir(), 'helm-')), 'run.jsonl');
  const journal = new JsonlJournal(journalPath);
  await journal.open();

  // Create and run the agent loop
  const loop = new AgentLoop(provider, toolRuntime, journal, { maxTurns: 5 });
  const result = await loop.run('hello-run', 'Say hello');

  // Print the response
  const lastMessage = result.messages[result.messages.length - 1];
  console.log('Agent:', lastMessage?.content);
  console.log('Journal:', journalPath);

  await journal.close();
}

main().catch(console.error);
