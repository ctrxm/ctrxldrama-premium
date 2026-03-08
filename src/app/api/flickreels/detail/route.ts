import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { getDrama } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

function getBestUrl(ep: any): string {
  if (ep.qualities) {
    const sorted = Object.entries(ep.qualities as Record<string, string>)
      .sort((a, b) => (parseInt(b[0]) || 0) - (parseInt(a[0]) || 0));
    if (sorted.length > 0) return sorted[0][1];
  }
  return ep.video_url || "";
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return encryptedResponse({ status_code: 0, msg: "ID param required" }, 400);

  try {
    const result = await getDrama(id);
    const drama = result.data?.drama;
    const episodes = result.data?.episodes || [];
    if (!drama) return encryptedResponse({ status_code: 404, msg: "Not found" }, 404);

    return encryptedResponse({
      drama: {
        title: drama.title,
        cover: drama.cover_url,
        description: drama.introduction || "",
        chapterCount: drama.chapter_count,
        labels: (result.data?.tags || []).map((t) => t.name),
        viewCount: drama.play_count || 0,
        source: "flickreels",
      },
      episodes: episodes.map((ep) => ({
        id: String(ep.id),
        name: ep.episode_name,
        index: ep.episode_index,
        unlock: true,
        raw: {
          chapter_id: String(ep.id),
          chapter_num: ep.episode_index,
          is_lock: 0,
          chapter_cover: "",
          introduce: "",
          chapter_title: ep.episode_name,
          videoUrl: getBestUrl(ep),
        },
      })),
    });
  } catch (error) {
    console.error("flickreels/detail error:", error);
    return encryptedResponse({ status_code: 0, msg: "Internal Server Error" }, 500);
  }
}
