import type { Register } from 'claude-code'

const PROTECTED = /(^|\/)\.env(\.|$)/

export const register: Register = on => {
  on('tool.call', { tool: 'Edit' }, ($, e, next) =>
    PROTECTED.test(e.file_path)
      ? { deny: `${$.plugin.name}: ${e.file_path} is protected here.` }
      : next(e),
  ).catch(($, e, next) =>
    next.called ? next(e) : { deny: `${$.plugin.name}: its guard failed.` },
  )

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const ran = await next({ ...e, command: e.command.trim() })
    const hasFailed = ran.deny === undefined && ran.isError === true

    $.ui.status(hasFailed ? `failed: ${e.command.slice(0, 40)}` : undefined)

    return ran
  })
}
