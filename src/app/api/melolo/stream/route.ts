import { NextRequest } from "next/server";
import { encryptedResponse } from "@/lib/api-utils";
import { getEpisodes } from "@/lib/sdrama";

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
  const videoId = request.nextUrl.searchParams.get("videoId");
  if (!videoId) return Response.json({ error: "Missing videoId" }, { status: 400 });

  try {
    const parts = videoId.split("_");
    if (parts.length < 2) {
      return Response.json({ error: "Invalid videoId format" }, { status: 400 });
    }
    const dramaId = parts[0];
    const epId = parts[1];

    const episodesRes = await getEpisodes(dramaId, { per_page: 500 });
    const ep = episodesRes.data?.find((e) => String(e.id) === epId);

    if (!ep) return Response.json({ error: "Episode not found" }, { status: 404 });

    const qualityMap: Record<string, string> = {
      "1080p": "video_6", "720p": "video_5", "540p": "video_4",
      "480p": "video_3", "360p": "video_2", "240p": "video_1",
    };

    const qualities: Record<string, { main_url: string }> = {};
    if (ep.qualities) {
      Object.entries(ep.qualities as Record<string, string>).forEach(([q, url]) => {
        const key = qualityMap[q] || "video_3";
        qualities[key] = { main_url: url };
      });
    }
    if (ep.video_url && Object.keys(qualities).length === 0) {
      qualities["video_5"] = { main_url: ep.video_url };
    }

    const videoModel = JSON.stringify({ video_list: qualities });
    const mainUrl = getBestUrl(ep);

    return encryptedResponse({
      code: 0,
      data: { main_url: mainUrl, video_model: videoModel },
    });
  } catch (error) {
    console.error("Error fetching Melolo stream:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
