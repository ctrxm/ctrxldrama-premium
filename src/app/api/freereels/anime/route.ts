import { encryptedResponse } from "@/lib/api-utils";
import { listDramas } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await listDramas({ provider: "freereels", per_page: 20 });
    const items = (result.data || []).map((d) => ({
      key: String(d.id),
      cover: d.cover_url,
      title: d.title,
      desc: d.introduction || "",
      episode_count: d.chapter_count,
      follow_count: d.play_count || 0,
    }));
    return encryptedResponse({ code: 0, message: "ok", data: { items } });
  } catch (error) {
    console.error("freereels/anime error:", error);
    return encryptedResponse({ code: 1, message: "error", data: { items: [] } });
  }
}
