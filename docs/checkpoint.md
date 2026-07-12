# Checkpoint

Auto-tracking file edits with rewind and summarize capabilities.

## How It Works

1. **Auto-snapshot** — before each `write`/`edit` tool call, the file content is captured
2. **Checkpoint creation** — after successful edit, a checkpoint is saved with the pre-edit snapshot
3. **Rewind** — restore files and/or conversation to any checkpoint
4. **Summarize** — compress conversation history to free context space

## Checkpoint Types

| Type | Trigger | Content |
|------|---------|---------|
| `session_start` | REPL starts | Empty (marker) |
| `prompt` | User sends message | Conversation position |
| `file_edit` | write/edit tool | Pre-edit file snapshots |

## CheckpointManager

```typescript
import { CheckpointManager } from '@helm/checkpoint';

const mgr = new CheckpointManager({
  sessionId: 'my-session',
  checkpointDir: '~/.helm/checkpoints',
  retentionDays: 30,
  enabled: true,
});

// Create checkpoint
const cp = mgr.createFromFileEdit(['/path/to/file.ts'], 5, 'edit file.ts');

// List checkpoints
const list = mgr.list();

// Restore code
const result = mgr.restore('cp-001', 'code');

// Restore code + conversation
const result = mgr.restore('cp-001', 'code+conversation');

// Clean expired
const removed = mgr.clean();
```

## Restore Actions

| Action | Code | Conversation | Use Case |
|--------|------|--------------|----------|
| `code+conversation` | ✅ | ✅ | Full rollback |
| `conversation` | ❌ | ✅ | Retry with different code |
| `code` | ✅ | ❌ | Keep dialog, undo code |
| `summarize_from` | ❌ | Compress after | Free context |
| `summarize_up_to` | ❌ | Compress before | Keep recent details |

## CLI Commands

```
/rewind                     # Show rewind menu
/checkpoint list            # List all checkpoints
/checkpoint restore cp-001  # Restore checkpoint
/checkpoint clean           # Clean expired checkpoints
```

## CLI Flags

```bash
# Disable checkpoints
pnpm repl --no-checkpoint

# Set retention days
pnpm repl --checkpoint-retention=7

# Custom checkpoint directory
pnpm repl --checkpoint-dir=~/.helm/checkpoints

# Enable git checkpoints
pnpm repl --git-checkpoint
```

## Storage

```
~/.helm/checkpoints/
├── index.json                    # Checkpoint metadata index
├── <session-id>/
│   ├── cp-001.json              # Checkpoint with file snapshots
│   ├── cp-002.json
│   └── ...
```
