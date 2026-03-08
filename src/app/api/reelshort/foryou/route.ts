import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { listDramas, dramaToLegacy } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const result = await listDramas({ provider: "reelshort", page, per_page: 20 });
    const dramas = (result.data || []).map(dramaToLegacy);
    return encryptedResponse(dramas);
  } catch (error) {
    console.error("reelshort/foryou error:", error);
    return encryptedResponse([]);
  }
}
