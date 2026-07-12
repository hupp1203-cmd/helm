# Changelog

All notable changes to Helm will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-07-12

### Added

#### Core Infrastructure
- **PR00** — TypeScript monorepo with pnpm workspaces
- **PR01** — `RunEvent` discriminated union + `JsonlJournal` append-only log
- **PR02** — `ScriptedProvider` + minimal `AgentLoop`
- **PR03** — `ToolRuntime` with tool registration and execution
- **PR04** — Permission system with risk levels and policies
- **PR05** — Cancellation and timeout with AbortSignal integration
- **PR06** — Error taxonomy with classified errors and retry logic
- **PR07** — Eval harness for testing agent behavior
- **PR08** — Replay system for replaying conversations from journal

#### Runtime
- **PR09** — File tools: read, write, edit, ls, glob with `WorkspaceGuard`
- **PR10** — Context builder and token counter
- **PR11** — Compaction with summarize and truncate strategies
- **PR12** — Subagent runtime with nested `AgentLoop` instances

#### Extensions
- **PR13** — MCP client for Model Context Protocol server integration
- **PR14** — Plugin system for loading tools from npm packages
- **PR15** — Skills system with builtin and custom slash commands
- **PR16** — Streaming infrastructure with `StreamingBus`
- **PR17** — Prompt management with template engine and variable injection
- **PR18** — DeepSeek provider (OpenAI-compatible)

#### CLI
- **PR19** — Interactive REPL with TUI helpers
- **PR20** — Batch runner for non-interactive execution

#### Operations
- **PR21** — Lifecycle hooks (pre:tool, post:tool, session:start)
- **PR22** — Observability: telemetry, metrics, traces, structured logging
- **PR23** — Usage/cost/budget tracking
- **PR24** — Cross-session memory (instructions, auto-memory, rules)
- **PR25** — Cross-session memory system
- **PR26** — Checkpoint and rewind system

#### Polish
- **PR27** — Examples, documentation, and release preparation
