import { encryptedResponse } from "@/lib/api-utils";
import { listDramas } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await listDramas({ provider: "melolo", per_page: 20, sort_by: "created_at", sort_order: "desc" });
    const books = (result.data || []).map((d) => ({
      book_id: String(d.id),
      book_name: d.title,
      thumb_url: d.cover_url,
      abstract: d.introduction || "",
      serial_count: d.chapter_count,
    }));
    return encryptedResponse({ books, has_more: false, next_offset: 0, algo: 1 });
  } catch (error) {
    console.error("melolo/latest error:", error);
    return encryptedResponse({ books: [], has_more: false, next_offset: 0 });
  }
}
