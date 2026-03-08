import { encryptedResponse } from "@/lib/api-utils";
import { popularDramas } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await popularDramas({ provider: "netshort", per_page: 20 });
    const dramas = (result.data || []).map((d) => ({
      shortPlayId: String(d.id),
      shortPlayLibraryId: String(d.external_id || d.id),
      title: d.title,
      cover: d.cover_url,
      labels: [],
      totalEpisodes: d.chapter_count,
    }));
    return encryptedResponse({
      success: true,
      data: [{ groupId: "popular", groupName: "Popular", contentRemark: "", dramas }],
    });
  } catch (error) {
    console.error("netshort/theaters error:", error);
    return encryptedResponse({ success: false, data: [] });
  }
}
