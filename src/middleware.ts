import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone()

    // Resolve "negative time stamp" error by moving client component redirection to middleware
    if (url.pathname === '/login') {
        const userAgent = request.headers.get('user-agent') || ''
        const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)
        const type = url.searchParams.get('type')

        if (isMobile && !type) {
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
