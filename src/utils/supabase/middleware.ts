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
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // refresh session if expired - required for Server Components
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes logic
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/api') &&
        request.nextUrl.pathname !== '/'
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (user && (request.nextUrl.pathname === '/' || (request.nextUrl.pathname.startsWith('/login') && request.nextUrl.pathname !== '/login/confirmed'))) {
        // Differentiation: Guest users (anonymous) stay at landing page when entering site root, 
        // but regular users get redirected to dashboard.
        const isAnonymous = user.is_anonymous
        if (isAnonymous && request.nextUrl.pathname === '/') {
            // Guest Mode Handling: We keep them as guest but stay at landing
            // If we want to force them to dashboard, we should change this.
            // For now, we allow guests to see the landing page without forcing logout.
            return supabaseResponse
        }

        const url = request.nextUrl.clone()
        url.pathname = '/today'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
