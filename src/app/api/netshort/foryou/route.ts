import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { listDramas } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const result = await listDramas({ provider: "netshort", page, per_page: 20 });
    const data = (result.data || []).map((d) => ({
      shortPlayId: String(d.id),
      shortPlayLibraryId: String(d.external_id || d.id),
      title: d.title,
      cover: d.cover_url,
      labels: [],
      heatScore: "",
      scriptName: "",
    }));
    return encryptedResponse({ success: true, data });
  } catch (error) {
    console.error("netshort/foryou error:", error);
    return encryptedResponse({ success: false, data: [] });
  }
}
