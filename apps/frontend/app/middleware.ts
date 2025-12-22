export function middleware(req) {
  const token = getToken(req);

  if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
    return redirect("/login");
  }
}
