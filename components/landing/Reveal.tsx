'use client'
import { useEffect } from 'react'

// Entrance for `[data-reveal]` elements below the first screen. Content is
// visible by default: the hidden starting state only applies once this
// script has run (`data-motion="on"`), so the page reads fine without it.
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.querySelector<HTMLElement>('.lp')
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.1 },
    )
    items.forEach((el, i) => {
      el.style.setProperty('--lp-delay', `${(i % 3) * 80}ms`)
      observer.observe(el)
    })
    root.dataset.motion = 'on'
    return () => observer.disconnect()
  }, [])

  return null
}
