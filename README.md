# Helm

A TypeScript-first Agent Harness for building AI coding assistants.

Helm provides the infrastructure layer between your LLM provider and your tools — agent loop, tool runtime, permission control, eval harness, replay, and more. It's designed to be learned from, extended, and built upon.

## Features

- 🔄 **Agent Loop** — multi-turn conversation with provider abstraction
- 🛠️ **Tool Runtime** — register, execute, and control tools with risk levels
- 🔒 **Permission System** — allow/deny policies, risk thresholds, non-interactive modes
- 📊 **Eval Harness** — test agent behavior against expected outcomes
- 🔁 **Replay System** — replay conversations from journal files
- ⏱️ **Cancellation & Timeout** — AbortSignal integration, wall-clock caps
- 🔄 **Retry & Error Taxonomy** — classified errors with exponential backoff
- 🔌 **MCP Client** — Model Context Protocol server integration
- 🧩 **Plugin System** — load tools from npm packages
- 🎯 **Skills System** — slash commands with builtin and custom skills
- 📡 **Streaming** — real-time token streaming with StreamingBus
- 📝 **Prompt Management** — template engine with variable injection
- 🪝 **Lifecycle Hooks** — pre:tool, post:tool, session:start hooks
- 📈 **Observability** — telemetry, metrics, traces, structured logging
- 💰 **Usage & Budget** — cost tracking, daily/monthly budgets
- 🧠 **Cross-session Memory** — persistent instructions, auto-memory, rules
- 📸 **Checkpoint & Rewind** — auto-snapshot files, restore code/conversation

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Type check
pnpm typecheck

# Start interactive REPL
pnpm repl
```

## Project Structure

```
helm/
├── packages/
│   ├── core/              # Types: RunEvent, Journal, Provider, Tool, Permission
│   ├── runtime/           # AgentLoop, ToolRuntime, FileTools, Compaction
│   ├── cli/               # REPL, batch runner, TUI helpers
│   ├── eval/              # Eval harness for testing agent behavior
│   ├── replay/            # Replay conversations from journal
│   ├── mcp/               # MCP client and registry
│   ├── plugin/            # Plugin loader and installer
│   ├── skill/             # Skill registry and builtins
│   ├── prompt/            # PromptBuilder and template engine
│   ├── hooks/             # HookRuntime and lifecycle hooks
│   ├── telemetry/         # TelemetryManager, exporters
│   ├── usage/             # UsageTracker, budgets, cost calculator
│   ├── memory/            # MemoryStore, auto-memory, rules
│   ├── checkpoint/        # CheckpointManager, store, rewind
│   └── provider-deepseek/ # OpenAI-compatible provider
├── examples/              # Working examples
├── docs/                  # Documentation
└── MANUAL_WALKTHROUGH.md  # Step-by-step walkthrough
```

## Usage

### Basic Agent Loop

```typescript
import { AgentLoop, ToolRuntime, ScriptedProvider } from '@helm/runtime';
import { JsonlJournal } from '@helm/core';

const provider = new ScriptedProvider([
  { role: 'assistant', content: 'Hello!' },
]);

const toolRuntime = new ToolRuntime();
const journal = new JsonlJournal('/tmp/run.jsonl');
await journal.open();

const loop = new AgentLoop(provider, toolRuntime, journal, { maxTurns: 5 });
const result = await loop.run('run-1', 'Say hello');

console.log(result.messages);
await journal.close();
```

### Custom Tools

```typescript
import { ToolRuntime } from '@helm/runtime';
import { RiskLevel } from '@helm/core';

const toolRuntime = new ToolRuntime();
toolRuntime.register({
  name: 'greet',
  description: 'Greet someone',
  riskLevel: RiskLevel.LOW,
  parameters: {
    type: 'object',
    properties: { name: { type: 'string' } },
    required: ['name'],
  },
  async execute(args) {
    return `Hello, ${args.name}!`;
  },
});
```

### CLI Flags

```bash
# DeepSeek provider
pnpm repl --provider=deepseek --api-key=YOUR_KEY

# Non-interactive mode
pnpm repl --non-interactive=auto-approve

# With MCP server
pnpm repl --mcp-server=calc="npx @modelcontextprotocol/server-calc"

# Disable features
pnpm repl --no-checkpoint --no-memory --no-telemetry

# Token budget
pnpm repl --token-budget=100000
```

## Documentation

- [Architecture](./docs/architecture.md) — system overview and data flow
- [API Reference](./docs/api.md) — public API for all packages
- [Providers](./docs/providers.md) — how to integrate LLM providers
- [Tools](./docs/tools.md) — building and registering tools
- [Hooks](./docs/hooks.md) — lifecycle hook system
- [Memory](./docs/memory.md) — cross-session memory system
- [Checkpoint](./docs/checkpoint.md) — checkpoint and rewind
- [Telemetry](./docs/telemetry.md) — observability and metrics

## Examples

See [examples/](./examples/) for working code:

- [basic/](./examples/basic/) — hello world, tools, provider
- [advanced/](./examples/advanced/) — hooks, memory, checkpoint, eval
- [providers/](./examples/providers/) — DeepSeek, OpenAI, custom
- [cli/](./examples/cli/) — interactive, non-interactive, pipeline

## License

MIT
