import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl
  
  // Identificar loja pelo subdomínio
  const subdomain = hostname.split('.')[0]
  
  // Se for subdomínio diferente de www e localhost
  if (subdomain !== 'www' && subdomain !== 'localhost') {
    // Adicionar store_slug aos headers para ser usado pelo app
    const response = NextResponse.next()
    response.headers.set('x-store-slug', subdomain)
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
