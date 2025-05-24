import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeToken } from './lib/utils'
const unAuthPaths = ['/dang-nhap', '/dang-ky', '/quen-mat-khau']
const adminPaths = ['/admin']
const privatePaths = [...adminPaths]

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const accessToken = (request.cookies.get('token')?.value)
    if (privatePaths.some(path => pathname.startsWith(path)) && !accessToken) {
        const url = new URL('/dang-nhap', request.url)
        return NextResponse.redirect(url)
    }
    if (accessToken) {

        if (unAuthPaths.some(path => pathname.startsWith(path))) {
            return NextResponse.redirect(new URL('/', request.url))
        }
        const role = decodeToken(accessToken!).role
        if (role === 'USER' && privatePaths.some(path => pathname.startsWith(path))) {
            return NextResponse.redirect(new URL('/', request.url))
        }

    }
    return NextResponse.next()
}
export const config = {
    matcher: ['/admin/:path*', '/dang-nhap', '/dang-ky', '/quen-mat-khau'],
}