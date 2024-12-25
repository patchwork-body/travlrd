import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tab = url.searchParams.get("tab");

  if (tab) {
    const cookieStore = cookies();
    cookieStore.set("selectedTab", tab, { path: "/dashboard/invoices", secure: process.env.NODE_ENV === 'production', sameSite: "strict" });
    const searchParams = new URLSearchParams({ query: tab });
    return NextResponse.redirect(new URL(`/dashboard/invoices?${searchParams}`, request.url));
  }

  return NextResponse.redirect(new URL("/dashboard/invoices", request.url));
}