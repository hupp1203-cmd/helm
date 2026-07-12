# Providers

A Provider is any LLM that implements the `Provider` interface.

## Interface

```typescript
interface Provider {
  send(messages: Message[], signal?: AbortSignal): Promise<Message>;
  setTools?(tools: ToolDef[]): void;
}
```

- `send()` — send messages to the LLM, return the assistant's response
- `setTools()` — optional, notify provider of available tools (for function calling)

## Built-in Providers

### ScriptedProvider

Returns pre-defined responses. Used for testing.

```typescript
import { ScriptedProvider } from '@helm/runtime';

const provider = new ScriptedProvider([
  { role: 'assistant', content: 'Hello!' },
  { role: 'assistant', content: 'Done.', toolCalls: [{ id: 'tc1', name: 'echo', args: { text: 'hi' } }] },
]);
```

### OpenAICompatibleProvider

Works with any OpenAI-compatible API (DeepSeek, OpenAI, etc.).

```typescript
import { OpenAICompatibleProvider } from '@helm/provider-deepseek';

const provider = new OpenAICompatibleProvider({
  apiKey: process.env.DEEPSEEK_API_KEY,
  model: 'deepseek-v4-flash',
  streamingBus, // optional: for real-time streaming
});
```

## Custom Provider

```typescript
import type { Provider, Message } from '@helm/core';

class MyProvider implements Provider {
  async send(messages: Message[], signal?: AbortSignal): Promise<Message> {
    const lastMessage = messages[messages.length - 1];

    // Call your LLM here
    const response = await callMyLLM(messages, { signal });

    return {
      role: 'assistant',
      content: response.text,
      toolCalls: response.toolCalls, // if using function calling
    };
  }

  setTools(tools: ToolDef[]): void {
    // Store tools for function calling
    this.tools = tools;
  }
}
```

## Using with CLI

```bash
# DeepSeek
pnpm repl --provider=deepseek --api-key=YOUR_KEY

# Custom provider (via programmatic API)
# See examples/providers/custom.ts
```

## Error Handling

Providers should throw `AgentError` (from `@helm/core`) for classified errors:

```typescript
import { AgentError } from '@helm/core';

throw new AgentError('Rate limit exceeded', 'provider', 'rate_limit');
```

The AgentLoop will catch, classify, and retry based on the retry policy.
