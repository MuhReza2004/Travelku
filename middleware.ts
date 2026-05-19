import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage = path.startsWith("/auth");
  const isApiAuth = path.startsWith("/api/auth");
  const isApi = path.startsWith("/api");
  const isStatic =
    path.startsWith("/_next") || path.startsWith("/favicon.ico");

  if (isStatic) return supabaseResponse;

  // API /api/auth/* routes are always accessible
  if (isApi && isApiAuth) return supabaseResponse;

  // Other API routes require auth
  if (isApi && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Page routes
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isAuthPage && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
