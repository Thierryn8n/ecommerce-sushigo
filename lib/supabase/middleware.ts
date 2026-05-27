import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // Proteger rotas de admin
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin') {
    if (!user) {
      url.pathname = '/login-adm'
      return NextResponse.redirect(url)
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, is_approved')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.is_admin || !profile.is_approved) {
      await supabase.auth.signOut()
      url.pathname = '/login-adm'
      return NextResponse.redirect(url)
    }
  }

  // Proteger setup - verificar se já existe loja
  if (request.nextUrl.pathname === '/setup') {
    const { data: stores } = await supabase
      .from('stores')
      .select('id')
      .limit(1)

    if (stores && stores.length > 0) {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
