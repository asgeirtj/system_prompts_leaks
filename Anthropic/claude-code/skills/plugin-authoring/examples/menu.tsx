import type { Register } from 'claude-code'

const ISSUE = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/issues\/(\d+)$/

export const register: Register = on => {
  on('ui.render', { component: 'ContextMenu' }, ($, e, next) => {
    const [href, repo, number] = ISSUE.exec(e.props.link?.href ?? '') ?? []
    const selected = e.props.selection?.text

    if (href === undefined && selected === undefined) {
      return next(e)
    }

    const { Box, Button, Link, Text } = $.ui.resolve(e)
    const insert = (text: string) => $.prompt.fill({ text, mode: 'insert' })

    return (
      <Box flexDirection="column">
        {href !== undefined && (
          <Button key="fix" onPress={() => insert(`Fix ${repo}#${number}: `)}>
            Start a fix <Text dimColor>Adds to the prompt</Text>
          </Button>
        )}
        {href !== undefined && (
          <Link href={`${href}#new_comment_field`}>Comment on the issue</Link>
        )}
        {selected !== undefined && (
          <Button
            key="quote"
            onPress={() => insert(`${selected.replace(/^/gm, '> ')}\n`)}
          >
            Quote in the prompt
          </Button>
        )}
      </Box>
    )
  })
}
