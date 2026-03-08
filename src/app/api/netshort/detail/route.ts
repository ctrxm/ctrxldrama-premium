import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { getDrama, getEpisodes } from "@/lib/sdrama";

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
  const shortPlayId = request.nextUrl.searchParams.get("shortPlayId");
  if (!shortPlayId) return encryptedResponse({ success: false, error: "shortPlayId is required" }, 400);

  try {
    const [detailRes, episodesRes] = await Promise.all([
      getDrama(shortPlayId),
      getEpisodes(shortPlayId, { per_page: 500 }),
    ]);

    const drama = detailRes.data?.drama;
    const rawEpisodes = episodesRes.data || [];
    if (!drama) return encryptedResponse({ success: false, error: "Not found" });

    const episodes = rawEpisodes.map((ep) => ({
      episodeId: String(ep.id),
      episodeNo: ep.episode_index + 1,
      cover: "",
      videoUrl: getBestUrl(ep),
      quality: "720p",
      isLock: false,
      likeNums: "0",
      subtitleUrl: ep.subtitle_url || ep.subtitles?.[0]?.url || "",
    }));

    return encryptedResponse({
      success: true,
      shortPlayId: String(drama.id),
      shortPlayLibraryId: String(drama.external_id || drama.id),
      title: drama.title,
      cover: drama.cover_url,
      description: drama.introduction || "",
      labels: (detailRes.data?.tags || []).map((t) => t.name),
      totalEpisodes: episodes.length,
      isFinish: true,
      payPoint: 0,
      episodes,
    });
  } catch (error) {
    console.error("netshort/detail error:", error);
    return encryptedResponse({ success: false, error: "Internal server error" });
  }
}
