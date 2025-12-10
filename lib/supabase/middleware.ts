import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/78dd0afe-6ff0-4a6c-80bb-1c5a03cfe141',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/middleware.ts:4',message:'Middleware entry',data:{pathname:request.nextUrl.pathname,host:request.nextUrl.host,origin:request.nextUrl.origin,search:request.nextUrl.search,headers:Object.fromEntries(request.headers.entries())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/78dd0afe-6ff0-4a6c-80bb-1c5a03cfe141',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/middleware.ts:36',message:'After auth check',data:{pathname:request.nextUrl.pathname,hasUser:!!user,isAdminRoute:request.nextUrl.pathname.startsWith('/admin'),isAuthRoute:request.nextUrl.pathname.startsWith('/auth')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/78dd0afe-6ff0-4a6c-80bb-1c5a03cfe141',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/middleware.ts:42',message:'Redirecting to login',data:{originalPath:request.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith("/auth") && user) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/78dd0afe-6ff0-4a6c-80bb-1c5a03cfe141',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/middleware.ts:49',message:'Redirecting authenticated user from auth page',data:{originalPath:request.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/78dd0afe-6ff0-4a6c-80bb-1c5a03cfe141',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase/middleware.ts:54',message:'Middleware exit - allowing request',data:{pathname:request.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  return supabaseResponse;
}

