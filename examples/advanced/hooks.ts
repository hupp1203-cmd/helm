/**
 * Hooks — lifecycle hooks for intercepting tool calls.
 *
 * Run: npx tsx examples/advanced/hooks.ts
 */

import { AgentLoop, ToolRuntime, ScriptedProvider } from '../../packages/runtime/dist/index.js';
import { JsonlJournal, RiskLevel } from '../../packages/core/dist/index.js';
import type { HookRuntimeLike } from '../../packages/runtime/dist/index.js';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

async function main() {
  const toolRuntime = new ToolRuntime();

  toolRuntime.register({
    name: 'write',
    description: 'Write content to a file',
    riskLevel: RiskLevel.HIGH,
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['path', 'content'],
    },
    async execute(args) {
      return `Wrote ${String(args.content).length} bytes to ${args.path}`;
    },
  });

  // Hook that logs all tool calls
  const hookRuntime: HookRuntimeLike = {
    async execute(event, context) {
      if (event === 'pre:tool') {
        console.log(`[Hook] Pre-tool: ${context.toolName}`);
        console.log(`[Hook] Args:`, context.toolInput);
      }
      if (event === 'post:tool') {
        console.log(`[Hook] Post-tool: ${context.toolName}`);
        console.log(`[Hook] Output: ${context.toolOutput?.slice(0, 100)}`);
      }
      return null; // allow execution
    },
  };

  const provider = new ScriptedProvider([
    {
      role: 'assistant',
      content: '',
      toolCalls: [{ id: 'tc1', name: 'write', args: { path: 'test.txt', content: 'hello' } }],
    },
    { role: 'assistant', content: 'File written!' },
  ]);

  const journalPath = join(mkdtempSync(join(tmpdir(), 'helm-')), 'run.jsonl');
  const journal = new JsonlJournal(journalPath);
  await journal.open();

  const loop = new AgentLoop(provider, toolRuntime, journal, {
    maxTurns: 5,
    hookRuntime,
  });

  const result = await loop.run('hooks-run', 'Write a file');

  const lastMessage = result.messages[result.messages.length - 1];
  console.log('Agent:', lastMessage?.content);

  await journal.close();
}

main().catch(console.error);
