'use client'
import { useSyncExternalStore } from 'react'

export const SIDEBAR_COLLAPSED_KEY = 'garal.sidebar.collapsed.v1'

// Fallback when storage is unavailable or throws: the state lives in memory
// for this page session.
let memoryValue: boolean | null = null
const listeners = new Set<() => void>()

function readStored(): boolean | null {
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

function persist(collapsed: boolean): boolean {
  try {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
    return true
  } catch {
    return false
  }
}

function getSnapshot(): boolean {
  return memoryValue ?? readStored() ?? false
}

// The server render (and hydration) is always expanded.
function getServerSnapshot(): boolean {
  return false
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Another tab collapsing the sidebar is picked up too.
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function setCollapsed(collapsed: boolean) {
  memoryValue = persist(collapsed) ? null : collapsed
  listeners.forEach(listener => listener())
}

// Test-only: forget the in-memory fallback between tests.
export function resetSidebarCollapsedMemory() {
  memoryValue = null
}

// A shared external store, read synchronously on mount: every page mounts its
// own AppShell, and a sidebar that collapsed only after mount would flash open
// on each navigation.
export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function toggle() {
    setCollapsed(!getSnapshot())
  }

  return { collapsed, toggle }
}
