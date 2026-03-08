import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { listDramas } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const result = await listDramas({ provider: "flickreels", page, per_page: 20 });
    const list = (result.data || []).map((d) => ({
      playlet_id: d.id,
      title: d.title,
      cover: d.cover_url,
      upload_num: String(d.chapter_count),
      introduce: d.introduction || "",
    }));
    return encryptedResponse({ status_code: 1, msg: "ok", data: { list } });
  } catch (error) {
    console.error("flickreels/foryou error:", error);
    return encryptedResponse({ status_code: 0, msg: "error", data: { list: [] } });
  }
}
