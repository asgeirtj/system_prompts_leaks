export type ToolCall = { id: string; tool: string; isDone: boolean }

declare module 'claude-code' {
  interface PluginState {
    'tool-calls': { calls: ToolCall[] }
  }
}
