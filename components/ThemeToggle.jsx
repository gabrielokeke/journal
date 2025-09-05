"use client"
// components/ThemeToggle.js
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { LuSun, LuMoon } from 'react-icons/lu'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <LuSun className="w-5 h-5 text-yellow-500" />
      ) : (
        <LuMoon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  )
}