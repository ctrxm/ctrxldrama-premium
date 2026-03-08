import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { searchDramas } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  if (!query) return encryptedResponse({ code: 0, data: { search_data: [] } });

  try {
    const result = await searchDramas({ q: query, provider: "melolo" });
    const books = (result.data || []).map((d) => ({
      book_id: String(d.id),
      book_name: d.title,
      thumb_url: d.cover_url,
      abstract: d.introduction || "",
      serial_count: d.chapter_count,
    }));
    return encryptedResponse({ code: 0, data: { search_data: [{ books }] } });
  } catch (error) {
    console.error("melolo/search error:", error);
    return encryptedResponse({ code: 1, data: { search_data: [] } });
  }
}
