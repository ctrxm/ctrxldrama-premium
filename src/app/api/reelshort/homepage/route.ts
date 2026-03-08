import { encryptedResponse } from "@/lib/api-utils";
import { popularDramas, dramaToLegacy } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await popularDramas({ provider: "reelshort", per_page: 20 });
    const lists = (result.data || []).map((d) => ({
      ...dramaToLegacy(d),
      book_id: String(d.id),
      book_title: d.title,
      book_pic: d.cover_url,
      special_desc: d.introduction || "",
      chapter_count: d.chapter_count,
    }));
    return encryptedResponse({ success: true, data: { lists } });
  } catch (error) {
    console.error("reelshort/homepage error:", error);
    return encryptedResponse({ success: true, data: { lists: [] } });
  }
}
