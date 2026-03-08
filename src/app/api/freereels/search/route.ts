import { NextRequest, NextResponse } from "next/server";
import { encryptedResponse } from "@/lib/api-utils";
import { searchDramas } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  if (!query) return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });

  try {
    const result = await searchDramas({ q: query, provider: "freereels" });
    const items = (result.data || []).map((d) => ({
      key: String(d.id),
      cover: d.cover_url,
      title: d.title,
      desc: d.introduction || "",
      episode_count: d.chapter_count,
    }));
    return encryptedResponse({ code: 0, message: "ok", data: { items } });
  } catch (error) {
    console.error("Error fetching FreeReels search:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
