import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useEffect } from 'react'
import type { Theme } from '@/types'

export const themeAtom = atomWithStorage<Theme>('theme', 'dark')

const resolvedThemeAtom = atom((get) => {
  const theme = get(themeAtom)
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
})

export const useTheme = () => {
  const [theme, setTheme] = useAtom(themeAtom)
  const [resolved] = useAtom(resolvedThemeAtom)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [resolved])

  return { theme, setTheme, resolved }
}
