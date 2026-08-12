import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const rawNext = req.nextUrl.searchParams.get("next") ?? "/admin";
  const next =
    rawNext.startsWith("/admin") && !rawNext.startsWith("//")
      ? rawNext
      : "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, req.nextUrl.origin));
    }
  }

  return NextResponse.redirect(
    new URL("/admin/forgot-password?error=expired", req.nextUrl.origin)
  );
}
