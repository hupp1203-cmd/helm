/**
 * Custom Tools — register and use custom tools with Helm.
 *
 * Run: npx tsx examples/basic/tools.ts
 */

import { AgentLoop, ToolRuntime, ScriptedProvider } from '../../packages/runtime/dist/index.js';
import { JsonlJournal, RiskLevel } from '../../packages/core/dist/index.js';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

async function main() {
  const toolRuntime = new ToolRuntime();

  // Register a custom calculator tool
  toolRuntime.register({
    name: 'calculate',
    description: 'Evaluate a math expression',
    riskLevel: RiskLevel.LOW,
    parameters: {
      type: 'object',
      properties: {
        expression: { type: 'string', description: 'Math expression to evaluate' },
      },
      required: ['expression'],
    },
    async execute(args) {
      const expr = String(args.expression ?? '');
      try {
        // Simple eval for demo (don't do this in production!)
        const result = Function(`"use strict"; return (${expr})`)();
        return JSON.stringify({ expression: expr, result });
      } catch (err) {
        return JSON.stringify({ error: `Failed to evaluate: ${expr}` });
      }
    },
  });

  // Register a timestamp tool
  toolRuntime.register({
    name: 'now',
    description: 'Get the current timestamp',
    riskLevel: RiskLevel.LOW,
    parameters: { type: 'object', properties: {} },
    async execute() {
      return JSON.stringify({ timestamp: new Date().toISOString() });
    },
  });

  // Scripted provider: agent calls calculate, then responds
  const provider = new ScriptedProvider([
    {
      role: 'assistant',
      content: '',
      toolCalls: [
        { id: 'tc1', name: 'calculate', args: { expression: '2 + 3 * 4' } },
      ],
    },
    {
      role: 'assistant',
      content: 'The result of 2 + 3 * 4 is 14.',
    },
  ]);

  const journalPath = join(mkdtempSync(join(tmpdir(), 'helm-')), 'run.jsonl');
  const journal = new JsonlJournal(journalPath);
  await journal.open();

  const loop = new AgentLoop(provider, toolRuntime, journal, { maxTurns: 5 });
  const result = await loop.run('tools-run', 'Calculate 2 + 3 * 4');

  const lastMessage = result.messages[result.messages.length - 1];
  console.log('Agent:', lastMessage?.content);

  // Show tool calls from journal
  const events = (await import('node:fs')).readFileSync(journalPath, 'utf-8')
    .trim().split('\n').map(l => JSON.parse(l));
  const toolCalls = events.filter((e: { type: string }) => e.type === 'tool:call');
  console.log('Tool calls:', toolCalls.map((e: { toolName: string }) => e.toolName));

  await journal.close();
}

main().catch(console.error);
