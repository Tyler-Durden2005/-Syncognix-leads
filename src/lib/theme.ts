"use client"

import { useSyncExternalStore } from "react"
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type Theme,
} from "./theme-config"

export type { ResolvedTheme, Theme }

const listeners = new Set<() => void>()
const DARK_QUERY = "(prefers-color-scheme: dark)"

function readTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    if (value === "light" || value === "dark" || value === "system") return value
  } catch {
    // Storage unavailable (private mode, blocked cookies) — use the default.
  }
  return DEFAULT_THEME
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const dark =
    theme === "dark" || (theme === "system" && matchMedia(DARK_QUERY).matches)

  // Suppress transitions for one frame so colors swap instantly.
  root.classList.add("[&_*]:!transition-none")
  root.classList.toggle("dark", dark)
  root.style.colorScheme = dark ? "dark" : "light"
  requestAnimationFrame(() => root.classList.remove("[&_*]:!transition-none"))
}

function subscribe(callback: () => void) {
  const media = matchMedia(DARK_QUERY)
  const onSystemChange = () => {
    if (readTheme() === "system") applyTheme("system")
    callback()
  }
  listeners.add(callback)
  window.addEventListener("storage", callback)
  media.addEventListener("change", onSystemChange)
  return () => {
    listeners.delete(callback)
    window.removeEventListener("storage", callback)
    media.removeEventListener("change", onSystemChange)
  }
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Ignore — the theme still applies for this session.
  }
  applyTheme(theme)
  listeners.forEach((listener) => listener())
}

function readResolved(): ResolvedTheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME)
  const resolvedTheme = useSyncExternalStore(
    subscribe,
    readResolved,
    (): ResolvedTheme => "light"
  )
  return { theme, resolvedTheme, setTheme }
}
