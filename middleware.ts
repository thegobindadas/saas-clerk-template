import { clerkMiddleware, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


const createRouteMatcher = (routes: string[]) => {
  return (pathname: string) => {
    return routes.includes(pathname);
  };
};

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-up",
  "/sign-in",
  "/api/webhook/register",
])



export default clerkMiddleware(async (auth, req) => {
  try {

    const { userId } = await auth()
    const url = new URL(req.url);
    const pathname = url.pathname;

  
    // ❌ If not authenticated, redirect to sign in page
    if (!userId && !isPublicRoute(pathname)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }


    if (userId) {

      const clerkClientInstance = await clerkClient();
      const user = await clerkClientInstance.users.getUser(userId);
      const role = user.publicMetadata.role as string | undefined;
      
      // Admin role redirection logic
      if (role === "admin" && pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }

      // Prevent non-admin users from accessing admin routes
      if (role !== "admin" && pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Redirect authenticated users trying to access public routes — except "/"
      if (isPublicRoute(pathname) && pathname !== "/") {
        return NextResponse.redirect(
          new URL(
            role === "admin" ? "/admin/dashboard" : "/dashboard",
            req.url
          )
        );
      }
    }
  } catch (error) {
    console.error("Error fetching user data from Clerk: ", error);
    return NextResponse.redirect(new URL("/error", req.url));
  }
})




export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};