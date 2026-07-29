import { useEffect, useState } from 'react'
import { Sun, Moon } from '@phosphor-icons/react'

function getInitialTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('lr-theme', theme)
  }, [theme])

  return (
    <button
      type="button"
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-card"
    >
      {theme === 'dark' ? <Sun size={20} weight="bold" /> : <Moon size={20} weight="bold" />}
    </button>
  )
}
