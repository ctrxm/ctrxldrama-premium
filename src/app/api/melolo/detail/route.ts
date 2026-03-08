import { NextRequest } from "next/server";
import { encryptedResponse } from "@/lib/api-utils";
import { getDrama, getEpisodes } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const bookId = request.nextUrl.searchParams.get("bookId");
  if (!bookId) return Response.json({ error: "Missing bookId" }, { status: 400 });

  try {
    const [detailRes, episodesRes] = await Promise.all([
      getDrama(bookId),
      getEpisodes(bookId, { per_page: 500 }),
    ]);

    const drama = detailRes.data?.drama;
    const episodes = episodesRes.data || [];
    if (!drama) return Response.json({ error: "Not found" }, { status: 404 });

    return encryptedResponse({
      code: 0,
      data: {
        video_data: {
          series_id_str: String(drama.id),
          series_title: drama.title,
          series_cover: drama.cover_url,
          series_intro: drama.introduction || "",
          episode_cnt: episodes.length,
          video_list: episodes.map((ep) => ({
            vid: `${drama.id}_${ep.id}`,
            vid_index: ep.episode_index,
            name: ep.episode_name,
            title: ep.episode_name,
            cover: drama.cover_url,
            episode_cover: "",
            duration: 0,
            digged_count: 0,
            comment_count: 0,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching Melolo detail:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
