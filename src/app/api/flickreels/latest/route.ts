import { encryptedResponse } from "@/lib/api-utils";
import { listDramas } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await listDramas({ provider: "flickreels", per_page: 20, sort_by: "created_at", sort_order: "desc" });
    const list = (result.data || []).map((d) => ({
      playlet_id: d.id,
      title: d.title,
      cover: d.cover_url,
      upload_num: String(d.chapter_count),
      introduce: d.introduction || "",
    }));
    return encryptedResponse({ status_code: 1, msg: "ok", data: [{ list }] });
  } catch (error) {
    console.error("flickreels/latest error:", error);
    return encryptedResponse({ status_code: 0, msg: "error", data: [] });
  }
}
