# Telemetry

Observability through structured logging, metrics, and traces.

## TelemetryManager

```typescript
import { TelemetryManager, loadTelemetryConfig } from '@helm/telemetry';

const config = loadTelemetryConfig();
const telemetry = new TelemetryManager(config, runId);
```

## Configuration

`.helm/telemetry.json`:

```json
{
  "enabled": true,
  "exporters": ["console", "file"],
  "logLevel": "info",
  "metricsEnabled": true,
  "tracesEnabled": true
}
```

## CLI Flags

```bash
# Disable telemetry
pnpm repl --no-telemetry

# Verbose logging
pnpm repl --telemetry-verbose
```

## Exporters

| Exporter | Description |
|----------|-------------|
| `console` | Logs to stdout |
| `file` | Writes to `.helm/traces/` |
| `noop` | Discards all data |

## Structured Logging

All events are logged as structured JSON:

```json
{
  "timestamp": "2026-07-12T14:30:00.000Z",
  "level": "info",
  "event": "tool:call",
  "runId": "repl-1234",
  "toolName": "write",
  "args": { "filePath": "src/index.ts" }
}
```

## Metrics

Tracked metrics:
- Tool call count by name
- Tool execution duration
- Token usage
- Error count by type
- Permission denied count

## Traces

Each run creates a trace with:
- All tool calls with timing
- Provider call duration
- Hook execution time
- Total run duration
