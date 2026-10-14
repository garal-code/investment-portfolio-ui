'use client'
import { useEffect, useState } from 'react'

export const SIDEBAR_COLLAPSED_KEY = 'garal.sidebar.collapsed.v1'

function readCollapsed(): boolean | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    if (raw === 'true') return true
    if (raw === 'false') return false
    return null
  } catch {
    return null
  }
}

function persistCollapsed(collapsed: boolean) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
  } catch {
    // Storage unavailable or full: the state stays in memory for this session.
  }
}

export function useSidebarCollapsed() {
  // First render is always expanded (matches the server output); the stored
  // value is applied after mount to avoid a hydration mismatch.
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = readCollapsed()
    if (stored !== null) setCollapsed(stored)
  }, [])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    persistCollapsed(next)
  }

  return { collapsed, toggle }
}
