# Hooks

Lifecycle hooks let you intercept and modify agent behavior.

## Hook Events

| Event | When | Use Case |
|-------|------|----------|
| `pre:tool` | Before tool execution | Validate args, add logging, deny execution |
| `post:tool` | After tool execution | Transform output, inject system messages |
| `session:start` | When REPL starts | Initialize state, load config |

## HookRuntime

```typescript
import { HookRuntime } from '@helm/hooks';

const hookRuntime = new HookRuntime({
  hooksDir: '.helm/hooks',
  journal,
  runId,
});
```

## Hook Config

`.helm/hooks.json`:

```json
{
  "hooks": {
    "pre:tool": [
      {
        "matcher": { "toolName": "write" },
        "command": "echo 'File write detected'",
        "timeout": 5000
      }
    ],
    "post:tool": [
      {
        "matcher": { "toolName": "edit" },
        "command": "npx prettier --write $TOOL_INPUT_filePath",
        "timeout": 30000
      }
    ]
  }
}
```

## Programmatic Hooks

```typescript
import type { HookRuntimeLike } from '@helm/runtime';

const hookRuntime: HookRuntimeLike = {
  async execute(event, context) {
    if (event === 'pre:tool' && context.toolName === 'write') {
      // Log file writes
      console.log(`Writing to ${context.toolInput?.filePath}`);
    }
    return null; // allow execution
  },
};

const loop = new AgentLoop(provider, toolRuntime, journal, {
  maxTurns: 10,
  hookRuntime,
});
```

## Hook Result

```typescript
interface HookResult {
  decision: 'allow' | 'deny' | 'modify';
  reason?: string;
  modifiedInput?: Record<string, unknown>;
  systemMessages: string[];
  results: Array<{
    decision: string;
    reason?: string;
    error?: string;
    timedOut?: boolean;
    durationMs: number;
  }>;
}
```

## Matchers

Match tools by name, args, or output:

```json
{
  "matcher": {
    "toolName": "write",
    "toolInput": { "filePath": "**/*.ts" }
  }
}
```
