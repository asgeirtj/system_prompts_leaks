import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { ToolCall } from '../types'

const PANE = 'tool-calls'
const calls = atom({ plugin: 'tool-calls', key: 'calls' } as const, [])

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'tool-calls',
      description: 'Show the tool calls of this session in a pane',
    })
    void $.ui.open({ id: PANE, title: 'Tool calls' })

    return next(e)
  })

  on('command.run', { command: 'tool-calls' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Tool calls' })

    return { text: 'Tool calls pane opened.' }
  })

  on('tool.call', async ($, e, next) => {
    const call: ToolCall = { id: e.tool_use_id, tool: e.tool, isDone: false }
    await update($, calls, list => [...list, call].slice(-200))
    const ran = await next(e)
    await update($, calls, list =>
      list.map(one => (one.id === call.id ? { ...one, isDone: true } : one)),
    )

    return ran
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const list = await read($, calls)
    const room = Math.max(1, (e.viewport?.rows ?? 24) - 4)

    return (
      <Box flexDirection="column">
        {list.length === 0 && <Text dimColor>No tool calls yet.</Text>}
        {list.slice(-room).map(call => (
          <Text dimColor={call.isDone}>
            {call.isDone ? 'done' : 'runs'} {call.tool}
          </Text>
        ))}
      </Box>
    )
  })
}
