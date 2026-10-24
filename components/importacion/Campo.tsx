import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

// One height for every field in the import panel: the native file input and
// select render at different heights with `.input-dark` alone.
export const CAMPO = 'input-dark h-[38px]'

// `.input-dark` select without the native look, so it matches the inputs next
// to it (fill, border, height) on every browser.
export function Selector({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={`${CAMPO} appearance-none pr-9 cursor-pointer disabled:cursor-not-allowed ${className}`}>
        {children}
      </select>
      <ChevronDown
        size={14}
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--color-ink-2)' }}
      />
    </div>
  )
}
