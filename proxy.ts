import { NextResponse, type NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/proxy"

/** Pages anyone can open without signing in */
const PUBLIC_PATHS = ["/signin", "/auth/", "/privacy", "/terms", "/credits", "/api/"]

/** Link-preview and search crawlers see pages (titles and the logo card) without signing in */
const CRAWLER =
  /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|discord|slack|linkedin|pinterest|embedly|preview|vkshare|skype|iframely/i

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => (p.endsWith("/") ? pathname.startsWith(p) : pathname === p || pathname.startsWith(`${p}/`)))
}

/**
 * Keeps the Supabase session fresh, and asks signed-out visitors to sign up
 * first: every page except sign-in, auth callbacks and the legal pages sends them
 * to /signin, then back to where they were going.
 */
export async function proxy(request: NextRequest) {
  const { response, signedIn } = await updateSession(request)
  const { pathname, search } = request.nextUrl
  if (signedIn !== false || isPublic(pathname) || CRAWLER.test(request.headers.get("user-agent") ?? "")) {
    return response
  }
  const url = new URL("/signin", request.url)
  url.searchParams.set("next", `${pathname}${search}`)
  const redirect = NextResponse.redirect(url)
  // Keep any refreshed session cookies
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}

export const config = {
  // Everything except static files: assets, images, videos and the generated icons/previews
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|twitter-image|manifest.webmanifest|robots.txt|sitemap.xml|posters/|logos/|fonts/|clips/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|woff2|mp4|webm)$).*)",
  ],
}
