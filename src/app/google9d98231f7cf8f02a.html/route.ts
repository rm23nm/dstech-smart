import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("google-site-verification: google9d98231f7cf8f02a.html", {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
