import { encryptedResponse } from "@/lib/api-utils";
import { popularDramas, dramaToLegacy } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await popularDramas({ provider: "dramabox", per_page: 20 });
    const dramas = (result.data || []).map(dramaToLegacy);
    return encryptedResponse(dramas);
  } catch (error) {
    console.error("dramabox/trending error:", error);
    return encryptedResponse([]);
  }
}
