/**
 * Custom Provider — build your own LLM provider.
 *
 * Run: npx tsx examples/basic/provider.ts
 */

import type { Provider, Message, ToolDef } from '../../packages/core/dist/index.js';
import { AgentLoop, ToolRuntime, ScriptedProvider } from '../../packages/runtime/dist/index.js';
import { JsonlJournal } from '../../packages/core/dist/index.js';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

/**
 * A simple echo provider that repeats the user's message.
 * Replace this with your actual LLM API call.
 */
class EchoProvider implements Provider {
  private tools: ToolDef[] = [];

  async send(messages: Message[]): Promise<Message> {
    const last = messages[messages.length - 1];
    const userText = typeof last?.content === 'string' ? last.content : '';

    return {
      role: 'assistant',
      content: `Echo: ${userText}`,
    };
  }

  setTools(tools: ToolDef[]): void {
    this.tools = tools;
  }
}

async function main() {
  const provider = new EchoProvider();
  const toolRuntime = new ToolRuntime();

  const journalPath = join(mkdtempSync(join(tmpdir(), 'helm-')), 'run.jsonl');
  const journal = new JsonlJournal(journalPath);
  await journal.open();

  const loop = new AgentLoop(provider, toolRuntime, journal, { maxTurns: 5 });
  const result = await loop.run('provider-run', 'Hello from custom provider!');

  const lastMessage = result.messages[result.messages.length - 1];
  console.log('Agent:', lastMessage?.content);

  await journal.close();
}

main().catch(console.error);
