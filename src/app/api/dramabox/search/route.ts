import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { searchDramas, dramaToLegacy } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  if (!query) return encryptedResponse([]);

  try {
    const result = await searchDramas({ q: query, provider: "dramabox" });
    const dramas = (result.data || []).map(dramaToLegacy);
    return encryptedResponse(dramas);
  } catch (error) {
    console.error("dramabox/search error:", error);
    return encryptedResponse([]);
  }
}
