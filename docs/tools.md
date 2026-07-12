# Tools

Tools are the primary way agents interact with the world.

## Interface

```typescript
interface Tool {
  name: string;
  description: string;
  parameters: JsonSchema;
  riskLevel?: RiskLevel;
  execute(args: Record<string, unknown>, signal?: AbortSignal): Promise<string>;
}
```

## Built-in File Tools

Helm registers 5 file tools by default:

| Tool | Risk | Description |
|------|------|-------------|
| `read` | LOW | Read file contents with offset/limit |
| `write` | HIGH | Create or overwrite a file |
| `edit` | HIGH | Find and replace text in a file |
| `ls` | LOW | List directory contents |
| `glob` | LOW | Find files matching a pattern |

All file tools are sandboxed by `WorkspaceGuard` — they can only access files within the workspace root.

## Custom Tools

```typescript
import { ToolRuntime } from '@helm/runtime';
import { RiskLevel } from '@helm/core';

const toolRuntime = new ToolRuntime();

toolRuntime.register({
  name: 'greet',
  description: 'Greet someone by name',
  riskLevel: RiskLevel.LOW,
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Name to greet' },
    },
    required: ['name'],
  },
  async execute(args) {
    return `Hello, ${args.name}!`;
  },
});
```

## Risk Levels

```typescript
enum RiskLevel {
  LOW = 0,      // Read-only, no side effects
  MEDIUM = 1,   // Minor side effects
  HIGH = 2,     // Significant side effects (file writes)
  CRITICAL = 3, // Destructive operations
}
```

Risk levels are used by the permission system to decide whether to allow, deny, or prompt for approval.

## Permission Integration

```typescript
import { PermissionRuntime } from '@helm/runtime';

const permRuntime = new PermissionRuntime();

// Auto-approve low-risk tools
permRuntime.allow({
  pattern: 'read',
  riskLevel: RiskLevel.LOW,
  description: 'Allow reading files',
});

// Deny dangerous tools
permRuntime.deny({
  pattern: 'rm',
  riskLevel: RiskLevel.CRITICAL,
  description: 'Deny rm command',
});
```

## WorkspaceGuard

All file tools use `WorkspaceGuard` to prevent path traversal:

```typescript
import { WorkspaceGuard } from '@helm/runtime';

const guard = new WorkspaceGuard('/path/to/workspace');

guard.validate('/path/to/workspace/src/index.ts'); // ✅ OK
guard.validate('/etc/passwd'); // ❌ throws Error
```
