# Memory

Cross-session memory system for persistent instructions, auto-memory, and rules.

## Memory Types

| Type | Scope | Purpose |
|------|-------|---------|
| Instruction | user/project | Persistent instructions loaded every session |
| Auto | project | Agent-learned facts (corrections, discoveries, preferences) |
| Rule | project | File-specific rules matched by glob patterns |

## Storage

```
~/.helm/memory/
├── user.md              # User-level instructions
└── rules/               # User-level rules

.helm/memory/
├── project.md           # Project-level instructions
├── auto.md              # Auto-memory (agent-written)
└── rules/
    ├── typescript.md    # Rules matched by glob
    └── python.md
```

## MemoryStore

```typescript
import { MemoryStore } from '@helm/memory';

const store = new MemoryStore();

// Load all memory
const result = store.load();

// Get instruction text for system prompt
const instructions = store.getInstructionText();

// Get auto-memory text
const auto = store.getAutoText();

// Get rules for a specific file
const rules = store.getRulesForFile('src/index.ts');

// Search memory
const matches = store.search('typescript');

// Write auto-memory
store.writeAutoMemory({
  trigger: 'correction',
  content: 'User prefers const over let',
});

// Clear memory
store.clear('session');
```

## Memory File Format

```markdown
---
type: instruction
project: helm
---

## Coding Style

- Use TypeScript strict mode
- Prefer interface over type
- Always annotate return types

## Build Commands

- `pnpm test` — run tests
- `pnpm build` — build project
```

## CLI Flags

```bash
# Disable memory
pnpm repl --no-memory

# Disable auto-memory writing
pnpm repl --no-auto-memory
```

## Slash Commands

```
/memory list          # Show memory summary
/memory show          # Display all memory
/memory search <q>    # Search memory
/memory clear         # Clear memory
/memory export        # Export as markdown
```
