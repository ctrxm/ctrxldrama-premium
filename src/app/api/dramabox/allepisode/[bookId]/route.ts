import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { getEpisodes } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

function qualityToNumber(q: string): number {
  return parseInt(q) || 480;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;

  try {
    const result = await getEpisodes(bookId, { per_page: 500 });
    const episodes = result.data || [];

    const mapped = episodes.map((ep) => {
      const qualityEntries = Object.entries(ep.qualities || {});
      let videoPathList: Array<{ quality: number; videoPath: string; isDefault: number; isVipEquity: number }>;

      if (qualityEntries.length > 0) {
        videoPathList = qualityEntries.map(([q, url], i) => ({
          quality: qualityToNumber(q),
          videoPath: url as string,
          isDefault: q === "720p" || (i === 0 && qualityEntries.length === 1) ? 1 : 0,
          isVipEquity: 0,
        }));
      } else if (ep.video_url) {
        videoPathList = [{ quality: 720, videoPath: ep.video_url, isDefault: 1, isVipEquity: 0 }];
      } else {
        videoPathList = [];
      }

      return {
        chapterId: String(ep.id),
        chapterIndex: ep.episode_index,
        isCharge: 0,
        chapterName: ep.episode_name,
        chapterImg: "",
        chargeChapter: false,
        cdnList: [
          {
            cdnDomain: "",
            isDefault: 1,
            videoPathList,
          },
        ],
      };
    });

    return encryptedResponse(mapped);
  } catch (error) {
    console.error("dramabox/allepisode error:", error);
    return encryptedResponse([]);
  }
}
