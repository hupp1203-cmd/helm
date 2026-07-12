# API Reference

## @helm/core

Core types and interfaces.

### RunEvent

Discriminated union of all event types in the system.

```typescript
type RunEvent =
  | { type: 'run:start'; runId: string; timestamp: number }
  | { type: 'run:end'; runId: string; timestamp: number; exitCode: number }
  | { type: 'tool:call'; runId: string; toolName: string; args: Record<string, unknown>; timestamp: number }
  | { type: 'tool:result'; runId: string; toolName: string; output: string; timestamp: number }
  // ... 20+ event types
```

### JsonlJournal

Append-only JSONL file writer.

```typescript
class JsonlJournal {
  constructor(path: string);
  open(): Promise<void>;
  append(event: RunEvent): Promise<void>;
  close(): Promise<void>;
}
```

### RiskLevel

```typescript
enum RiskLevel {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  CRITICAL = 3,
}
```

### Provider

```typescript
interface Provider {
  send(messages: Message[], signal?: AbortSignal): Promise<Message>;
  setTools?(tools: ToolDef[]): void;
}
```

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

### StreamingBus

Event emitter for real-time token streaming.

```typescript
class StreamingBus {
  emit(event: StreamingEvent): void;
  on(handler: (event: StreamingEvent) => void): void;
  off(handler: (event: StreamingEvent) => void): void;
  stats: { textTokens: number; toolCallDeltaCount: number };
}
```

---

## @helm/runtime

Agent loop and tool runtime.

### AgentLoop

```typescript
class AgentLoop {
  constructor(
    provider: Provider,
    toolRuntime: ToolRuntime,
    journal: JsonlJournal,
    options: AgentLoopOptions,
  );
  run(runId: string, userMessage: string, continueFrom?: MessageRecord[]): Promise<AgentLoopResult>;
}
```

#### AgentLoopOptions

```typescript
interface AgentLoopOptions {
  maxTurns: number;
  signal?: AbortSignal;
  maxDurationMs?: number;
  retryPolicy?: RetryPolicy;
  tokenBudget?: TokenBudget;
  contextBuilder?: ContextBuilder;
  compaction?: Compaction;
  hookRuntime?: HookRuntimeLike;
  parentRunId?: string;
}
```

### ToolRuntime

```typescript
class ToolRuntime {
  constructor(permissionRuntime?: PermissionRuntime, policy?: PermissionPolicy);
  register(tool: Tool): void;
  list(): Tool[];
  getToolNames(): string[];
  execute(name: string, args: Record<string, unknown>, signal?: AbortSignal): Promise<string>;
  checkPermission(name: string, args: Record<string, unknown>): PermissionDecision | null;
}
```

### PermissionRuntime

```typescript
class PermissionRuntime {
  allow(rule: PermissionRule): void;
  deny(rule: PermissionRule): void;
  check(toolName: string, args: Record<string, unknown>): PermissionDecision | null;
}
```

### Compaction

```typescript
interface Compaction {
  strategy: 'summarize' | 'truncate';
  compact(messages: Message[], tools: Tool[], signal: AbortSignal): Promise<CompactionResult>;
}
```

### FileTools

```typescript
function registerFileTools(toolRuntime: ToolRuntime, workspaceRoot: string): WorkspaceGuard;
```

Registers `read`, `write`, `edit`, `ls`, `glob` tools.

---

## @helm/checkpoint

Checkpoint and rewind system.

### CheckpointManager

```typescript
class CheckpointManager {
  constructor(opts: CheckpointManagerOptions);
  createFromFileEdit(filePaths: string[], conversationIndex: number, description?: string): Checkpoint | null;
  createFromPrompt(promptText: string, conversationIndex: number): Checkpoint | null;
  createSessionStart(conversationIndex: number): Checkpoint | null;
  list(): CheckpointListEntry[];
  restore(checkpointId: string, action: RestoreAction): RestoreResult | null;
  clean(): number;
}
```

---

## @helm/memory

Cross-session memory.

### MemoryStore

```typescript
class MemoryStore {
  constructor(opts?: { userDir?: string; projectDir?: string });
  load(): MemoryLoadResult;
  getInstructionText(): string;
  getAutoText(): string;
  getRulesForFile(filePath: string): MemoryRule[];
  writeAutoMemory(write: AutoMemoryWrite): void;
  search(keyword: string): SearchResult[];
  clear(scope: 'session' | 'project' | 'all'): void;
}
```

---

## @helm/mcp

MCP client integration.

### McpRegistry

```typescript
class McpRegistry {
  constructor(journal: JsonlJournal, runId: string);
  connect(servers: McpServerConfig[]): Promise<ConnectResult[]>;
  tools(): Tool[];
  disconnect(): Promise<void>;
}
```

---

## @helm/hooks

Lifecycle hooks.

### HookRuntime

```typescript
class HookRuntime {
  constructor(opts: HookRuntimeOptions);
  execute(event: string, context: HookContext): Promise<HookResult | null>;
}
```

Hook events: `pre:tool`, `post:tool`, `session:start`.
