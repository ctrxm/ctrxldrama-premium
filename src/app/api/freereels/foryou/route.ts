import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { listDramas } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const page = Math.floor(parseInt(request.nextUrl.searchParams.get("offset") || "0") / 20) + 1;
    const result = await listDramas({ provider: "freereels", page, per_page: 20 });
    const items = (result.data || []).map((d) => ({
      key: String(d.id),
      cover: d.cover_url,
      title: d.title,
      desc: d.introduction || "",
      episode_count: d.chapter_count,
      follow_count: d.play_count || 0,
    }));
    const hasMore = result.meta?.page < result.meta?.total_pages;
    return encryptedResponse({
      code: 0,
      message: "ok",
      data: { items, page_info: { next: String(page * 20), has_more: hasMore } },
    });
  } catch (error) {
    console.error("freereels/foryou error:", error);
    return encryptedResponse({ code: 1, message: "error", data: { items: [] } });
  }
}
