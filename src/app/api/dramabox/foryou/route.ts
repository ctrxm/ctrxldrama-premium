import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { listDramas } from "@/lib/sdrama";
import { dramaToLegacy } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const result = await listDramas({ provider: "dramabox", page, per_page: 20 });
    const dramas = (result.data || []).map(dramaToLegacy);
    return encryptedResponse(dramas);
  } catch (error) {
    console.error("dramabox/foryou error:", error);
    return encryptedResponse([]);
  }
}
