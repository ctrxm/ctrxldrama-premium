import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { searchDramas } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  if (!query) return encryptedResponse({ success: true, data: [] });

  try {
    const result = await searchDramas({ q: query, provider: "netshort" });
    const data = (result.data || []).map((d) => ({
      shortPlayId: String(d.id),
      shortPlayLibraryId: String(d.external_id || d.id),
      title: d.title,
      cover: d.cover_url,
      labels: [],
    }));
    return encryptedResponse({ success: true, data });
  } catch (error) {
    console.error("netshort/search error:", error);
    return encryptedResponse({ success: true, data: [] });
  }
}
