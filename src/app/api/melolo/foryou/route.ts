import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { listDramas } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const page = Math.floor(parseInt(request.nextUrl.searchParams.get("offset") || "0") / 20) + 1;
    const result = await listDramas({ provider: "melolo", page, per_page: 20 });
    const books = (result.data || []).map((d) => ({
      book_id: String(d.id),
      book_name: d.title,
      thumb_url: d.cover_url,
      abstract: d.introduction || "",
      serial_count: d.chapter_count,
    }));
    const hasMore = result.meta?.page < result.meta?.total_pages;
    return encryptedResponse({ books, has_more: hasMore, next_offset: page * 20, algo: 1 });
  } catch (error) {
    console.error("melolo/foryou error:", error);
    return encryptedResponse({ books: [], has_more: false, next_offset: 0 });
  }
}
