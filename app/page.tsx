import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Landing } from '@/components/landing/Landing'
import { AUTH_COOKIE_NAME } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Garal · Cartera — tu cartera de inversión, de un vistazo',
  description:
    'Sigue tu cartera de inversión: valor y rentabilidad por periodo, composición, posiciones, movimientos y frontera eficiente.',
}

// Public entry point. Visitors see the landing; anyone with a session cookie
// goes straight to the dashboard (same cookie-presence check as proxy.ts).
export default async function Home() {
  const cookieStore = await cookies()
  if (cookieStore.has(AUTH_COOKIE_NAME)) redirect('/dashboard')
  return <Landing />
}
