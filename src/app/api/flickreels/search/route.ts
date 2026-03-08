import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { searchDramas } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  if (!query) return encryptedResponse({ status_code: 0, msg: "Query param required" }, 400);

  try {
    const result = await searchDramas({ q: query, provider: "flickreels" });
    const data = (result.data || []).map((d) => ({
      playlet_id: d.id,
      title: d.title,
      cover: d.cover_url,
      introduce: d.introduction || "",
    }));
    return encryptedResponse({ status_code: 1, msg: "ok", data });
  } catch (error) {
    console.error("flickreels/search error:", error);
    return encryptedResponse({ status_code: 0, msg: "error", data: [] });
  }
}
