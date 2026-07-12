# Architecture

Helm is a TypeScript-first Agent Harness — the infrastructure layer between your LLM provider and your tools.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLI / REPL                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Input    │  │ Output   │  │ Status   │  │ Slash    │   │
│  │ Frame    │  │ Cards    │  │ Bar      │  │ Commands │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       AgentLoop                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Provider │→│ Messages │→│ Tool     │→│ Journal  │   │
│  │ Call     │  │ History  │  │ Execute  │  │ Append   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│       ↑                         │                           │
│       │    ┌──────────┐         │                           │
│       └────│ Retry    │←────────┘                           │
│            │ + Hooks  │                                     │
│            └──────────┘                                     │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ToolRuntime  │  │ Permission   │  │   Hooks      │
│              │  │ Runtime      │  │   Runtime    │
│ ┌──────────┐ │  │              │  │              │
│ │ File     │ │  │ ┌──────────┐ │  │ ┌──────────┐ │
│ │ Tools    │ │  │ │ Allow/   │ │  │ │ Pre:tool │ │
│ ├──────────┤ │  │ │ Deny     │ │  │ │ Post:tool│ │
│ │ Custom   │ │  │ │ Policies │ │  │ │ Session  │ │
│ │ Tools    │ │  │ └──────────┘ │  │ └──────────┘ │
│ ├──────────┤ │  └──────────────┘  └──────────────┘
│ │ MCP      │ │
│ │ Tools    │ │
│ ├──────────┤ │
│ │ Plugin   │ │
│ │ Tools    │ │
│ └──────────┘ │
└──────────────┘
```

## Data Flow

1. **User Input** → CLI captures input, creates user message
2. **AgentLoop.run()** → starts turn loop
3. **Provider.send()** → sends messages to LLM, gets response
4. **Tool Calls** → if response has tool calls, execute them
5. **Permission Check** → verify tool is allowed
6. **Hook Execution** → run pre:tool hooks
7. **Tool Execution** → call tool.execute()
8. **Hook Execution** → run post:tool hooks
9. **Journal** → append events (tool:call, tool:result, etc.)
10. **Loop** → repeat until no more tool calls or max turns

## Package Dependencies

```
core ← runtime ← cli
  ↑        ↑       ↑
  │        │       ├── mcp
  │        │       ├── plugin
  │        │       ├── skill
  │        │       ├── prompt
  │        │       ├── hooks
  │        │       ├── telemetry
  │        │       ├── usage
  │        │       ├── memory
  │        │       └── checkpoint
  │        │
  │        └── provider-deepseek
  │
  └── eval, replay
```

## Key Abstractions

### Provider

```typescript
interface Provider {
  send(messages: Message[], signal?: AbortSignal): Promise<Message>;
  setTools?(tools: ToolDef[]): void;
}
```

Any LLM that implements this interface can be used with Helm.

### Tool

```typescript
interface Tool {
  name: string;
  description: string;
  parameters: JsonSchema;
  riskLevel?: RiskLevel;
  execute(args: Record<string, unknown>, signal?: AbortSignal): Promise<string>;
}
```

Tools are the primary way agents interact with the world.

### Journal

```typescript
interface JsonlJournal {
  append(event: RunEvent): Promise<void>;
  close(): Promise<void>;
}
```

Append-only log of all events in a run. Used for replay, debugging, and observability.

### RunEvent

Discriminated union of all event types:
- `run:start`, `run:end`, `turn:start`, `turn:end`
- `tool:call`, `tool:result`
- `error`, `retry`, `run:cancelled`
- `permission:allowed`, `permission:denied`
- `compaction`, `checkpoint:create`, `memory:load`, etc.
