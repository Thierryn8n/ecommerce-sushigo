"use client"

import { usePathname } from 'next/navigation'
import { MobileBottomNav } from './mobile-bottom-nav'

export function RouteAwareNav() {
  const pathname = usePathname()

  // Não mostra nas rotas admin, api, auth, e no perfil (que já tem seu próprio bottom nav)
  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/api') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/login-adm') ||
    pathname?.startsWith('/setup') ||
    pathname?.startsWith('/perfil')
  ) {
    return null
  }

  return <MobileBottomNav />
}
