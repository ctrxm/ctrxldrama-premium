import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { searchDramas } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  if (!query) return encryptedResponse({ success: true, data: [] });

  try {
    const result = await searchDramas({ q: query, provider: "reelshort" });
    const data = (result.data || []).map((d) => ({
      book_id: String(d.id),
      book_title: d.title,
      book_pic: d.cover_url,
      special_desc: d.introduction || "",
      chapter_count: d.chapter_count,
    }));
    return encryptedResponse({ success: true, data });
  } catch (error) {
    console.error("reelshort/search error:", error);
    return encryptedResponse({ success: false, data: [] });
  }
}
