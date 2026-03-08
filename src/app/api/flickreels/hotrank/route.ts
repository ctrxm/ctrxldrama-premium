import { encryptedResponse } from "@/lib/api-utils";
import { popularDramas } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await popularDramas({ provider: "flickreels", per_page: 20 });
    const dramas = (result.data || []).map((d) => ({
      playlet_id: d.id,
      title: d.title,
      cover: d.cover_url,
      introduce: d.introduction || "",
    }));
    return encryptedResponse({
      status_code: 1,
      msg: "ok",
      data: [{ name: "Popular", rank_type: 1, data: dramas }],
    });
  } catch (error) {
    console.error("flickreels/hotrank error:", error);
    return encryptedResponse({ status_code: 0, msg: "error", data: [] });
  }
}
