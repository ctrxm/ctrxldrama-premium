import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { getEpisodes } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const bookId = request.nextUrl.searchParams.get("bookId");
  const episodeNumberStr = request.nextUrl.searchParams.get("episodeNumber");

  if (!bookId || !episodeNumberStr) {
    return encryptedResponse({ error: "bookId and episodeNumber are required" }, 400);
  }

  const episodeNumber = parseInt(episodeNumberStr);

  try {
    const result = await getEpisodes(bookId, { per_page: 500 });
    const episodes = result.data || [];
    const ep = episodes.find((e) => e.episode_index === episodeNumber - 1) || episodes[episodeNumber - 1];

    if (!ep) {
      return encryptedResponse({ success: false, isLocked: false, videoList: [] });
    }

    const qualityEntries = Object.entries(ep.qualities || {});
    let videoList: Array<{ url: string; encode: string; quality: number; bitrate: string }>;

    if (qualityEntries.length > 0) {
      videoList = qualityEntries.map(([q, url]) => ({
        url: url as string,
        encode: "h264",
        quality: parseInt(q) || 720,
        bitrate: "0",
      }));
    } else if (ep.video_url) {
      videoList = [{ url: ep.video_url, encode: "h264", quality: 720, bitrate: "0" }];
    } else {
      videoList = [];
    }

    return encryptedResponse({ success: true, isLocked: false, videoList });
  } catch (error) {
    console.error("reelshort/watch error:", error);
    return encryptedResponse({ success: false, isLocked: false, videoList: [] });
  }
}
