import { NextResponse, type NextRequest } from 'next/server';

const locales = ['en', 'ar'] as const;
const defaultLocale = 'en';

function hasLocalePrefix(pathname: string) {
  return locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (hasLocalePrefix(pathname)) return NextResponse.next();

  const trimmed =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${trimmed === '/' ? '' : trimmed}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next|assets|api|.*\\.).*)'],
};
