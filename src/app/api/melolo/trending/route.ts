import { encryptedResponse } from "@/lib/api-utils";
import { popularDramas } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await popularDramas({ provider: "melolo", per_page: 20 });
    const books = (result.data || []).map((d) => ({
      book_id: String(d.id),
      book_name: d.title,
      thumb_url: d.cover_url,
      abstract: d.introduction || "",
      serial_count: d.chapter_count,
    }));
    return encryptedResponse({ books, has_more: false, next_offset: 0, algo: 1 });
  } catch (error) {
    console.error("melolo/trending error:", error);
    return encryptedResponse({ books: [], has_more: false, next_offset: 0 });
  }
}
