import type { ThemeColors } from 'claude-code'

type Hex = string

type Mode = {
  gray?: {
    anchors?: { 'surface-0': Hex; 'text-primary': Hex } & Partial<
      Record<'surface-1' | 'surface-2' | 'surface-3' | 'text-secondary' | 'text-muted', Hex>
    >
    stops?: Record<number, Hex>
  }
  roles?: Roles
  git?: Partial<
    Record<'added' | 'removed' | 'modified' | 'merged' | 'closed' | 'conflicting' | 'draft', Hex>
  >
}

type Role = Hex | { seed?: Hex; stops?: Record<number, Hex>; fillShade?: number }

type Roles = Partial<Record<'accent' | 'danger' | 'success' | 'warning' | 'pro', Role>>

/** A whole theme from a few colors, and what fails. Throws on a color it can't use. */
export function makeColors(definition: {
  label: string
  id?: string
  roles?: Roles
  light?: Mode
  dark?: Mode
  codeTheme?: { light?: string; dark?: string }
  contrast?: 'more'
  only?: 'light' | 'dark'
}): { theme: ThemeColors; problems: string[] }

/** What's wrong with a theme from anywhere, as plain lines. */
export function checkColors(colors: unknown): string[]
