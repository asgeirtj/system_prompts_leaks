import { expect, test } from 'claude-code/testing'

const MENU = {
  plugin: 'issue-menu',
  surface: 'desktop',
  component: 'ContextMenu',
} as const

test('an issue link in a selection gets a row for each', async ($, on) => {
  const filled: string[] = []
  on('prompt.fill', (_, e) => {
    filled.push(e.text)

    return { isFilled: true, text: e.text, cursor: e.text.length }
  })

  const ui = await $.ui.mount({
    ...MENU,
    props: {
      link: { href: 'https://github.com/acme/app/issues/7' },
      selection: { text: 'one\ntwo' },
    },
  })
  await ui.press({ key: 'fix' })
  await ui.press({ key: 'quote' })

  expect(filled).toEqual(['Fix acme/app#7: ', '> one\n> two\n'])
  await ui.unmount()
})

test('any other link gets no row', async $ => {
  const ui = await $.ui.mount({
    ...MENU,
    props: { link: { href: 'https://github.com/acme/app' } },
  })

  expect(await ui.find({ type: 'Button' })).toBeUndefined()
  await ui.unmount()
})
