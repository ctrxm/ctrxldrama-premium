import { NextRequest, NextResponse } from "next/server";
import { encryptedResponse } from "@/lib/api-utils";
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
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });

  try {
    const [detailRes, episodesRes] = await Promise.all([
      getDrama(id),
      getEpisodes(id, { per_page: 500 }),
    ]);

    const drama = detailRes.data?.drama;
    const rawEpisodes = episodesRes.data || [];
    if (!drama) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const episodeList = rawEpisodes.map((ep, idx) => {
      const videoUrl = getBestUrl(ep);
      const subtitleUrl = ep.subtitle_url || ep.subtitles?.[0]?.url || "";
      return {
        id: String(ep.id),
        name: ep.episode_name,
        index: ep.episode_index,
        video_url: videoUrl,
        external_audio_h264_m3u8: videoUrl,
        external_audio_h265_m3u8: "",
        m3u8_url: videoUrl.includes(".m3u8") ? videoUrl : "",
        subtitle_list: subtitleUrl ? [{ language: "id-ID", url: subtitleUrl }] : [],
        subtitleUrl,
      };
    });

    return encryptedResponse({
      data: {
        info: {
          id: String(drama.id),
          title: drama.title,
          cover: drama.cover_url,
          desc: drama.introduction || "",
          episode_count: episodeList.length,
          episode_list: episodeList,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching FreeReels detail:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
