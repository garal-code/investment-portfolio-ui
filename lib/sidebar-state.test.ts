import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SIDEBAR_COLLAPSED_KEY, resetSidebarCollapsedMemory, useSidebarCollapsed } from './sidebar-state'

afterEach(() => {
  vi.restoreAllMocks()
  resetSidebarCollapsedMemory()
})

describe('useSidebarCollapsed', () => {
  it('starts expanded when nothing is stored', async () => {
    const { result } = renderHook(() => useSidebarCollapsed())

    await waitFor(() => expect(result.current.collapsed).toBe(false))
  })

  it('applies the stored value', async () => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, 'true')

    const { result } = renderHook(() => useSidebarCollapsed())

    await waitFor(() => expect(result.current.collapsed).toBe(true))
  })

  // Every page mounts its own AppShell: a sidebar that started expanded and
  // collapsed after mount would flash open on each navigation.
  it('renders collapsed on the very first render when the stored value says so', () => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, 'true')
    const renders: boolean[] = []

    renderHook(() => {
      const state = useSidebarCollapsed()
      renders.push(state.collapsed)
      return state
    })

    expect(renders[0]).toBe(true)
  })

  it('shares the state between mounted sidebars', () => {
    const a = renderHook(() => useSidebarCollapsed())
    const b = renderHook(() => useSidebarCollapsed())

    act(() => a.result.current.toggle())

    expect(b.result.current.collapsed).toBe(true)
  })

  it('toggle flips the state and persists it', async () => {
    const { result } = renderHook(() => useSidebarCollapsed())

    act(() => result.current.toggle())
    expect(result.current.collapsed).toBe(true)
    expect(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY)).toBe('true')

    act(() => result.current.toggle())
    expect(result.current.collapsed).toBe(false)
    expect(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY)).toBe('false')
  })

  it('ignores an invalid stored value', async () => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, 'banana')

    const { result } = renderHook(() => useSidebarCollapsed())

    await waitFor(() => expect(result.current.collapsed).toBe(false))
  })

  it('keeps working in memory when storage throws', () => {
    const storage = window.localStorage
    vi.spyOn(storage, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })

    const { result } = renderHook(() => useSidebarCollapsed())
    act(() => result.current.toggle())

    expect(result.current.collapsed).toBe(true)
  })

  it('works when window.localStorage is undefined', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage')!
    Object.defineProperty(window, 'localStorage', { value: undefined, configurable: true, writable: true })
    try {
      const { result } = renderHook(() => useSidebarCollapsed())
      act(() => result.current.toggle())
      expect(result.current.collapsed).toBe(true)
    } finally {
      Object.defineProperty(window, 'localStorage', original)
    }
  })
})
