import { encryptedResponse } from "@/lib/api-utils";
import { listDramas, dramaToLegacy } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await listDramas({ provider: "dramabox", per_page: 20, sort_by: "created_at", sort_order: "desc" });
    const dramas = (result.data || []).map(dramaToLegacy);
    return encryptedResponse(dramas);
  } catch (error) {
    console.error("dramabox/latest error:", error);
    return encryptedResponse([]);
  }
}
