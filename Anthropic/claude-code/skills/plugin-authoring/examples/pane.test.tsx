import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'tool-calls',
  component: 'Pane',
  requestId: 'tool-calls',
  props: {
    title: 'Tool calls',
    isFocused: false,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

test('the pane lists a tool call, on every surface', async ($, on) => {
  // Nothing sits beneath the plugin: each hook here stands for the engine.
  // A call on `$` is answered `{ value }`; an event by its own result.
  on('command.register', () => ({ value: { command: 'tool-calls' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.tool.call({ tool: 'Bash', command: 'ls' })

  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })

    // A Text takes no `key`: it is found by its words.
    const row = await ui.find({ type: 'Text', text: /Bash/ })
    expect(row?.text).toBe('done Bash')
    await ui.unmount()
  }
})

test('a value an earlier version stored is declined', async ($, on) => {
  // What the code before this edit wrote stays through the reload.
  on('state.get', () => ({
    value: { value: [{ tool: 'Bash' }], version: 1 },
  }))

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  expect((await ui.find({ type: 'Text' }))?.text).toBe('No tool calls yet.')
  await ui.unmount()
})

test('a drawing the mod leaves goes to the engine', async ($, on) => {
  // Nothing draws beneath the plugin either: this hook stands for the engine,
  // and like any `ui.render` hook it answers with an element.
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>engine</Text>
  })

  const ui = await $.ui.mount({
    ...PANE,
    requestId: 'other',
    surface: 'desktop',
  })

  expect((await ui.find({ type: 'Text', text: /engine/ }))?.text).toBe('engine')
  await ui.unmount()
})
