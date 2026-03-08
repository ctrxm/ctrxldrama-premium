import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { getDrama } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const bookId = request.nextUrl.searchParams.get("bookId");
  if (!bookId) return encryptedResponse({ error: "bookId is required" }, 400);

  try {
    const result = await getDrama(bookId);
    const drama = result.data?.drama;
    if (!drama) return encryptedResponse({ error: "Not found" }, 404);

    return encryptedResponse({
      success: true,
      bookId: String(drama.id),
      title: drama.title,
      cover: drama.cover_url,
      description: drama.introduction || "",
      totalEpisodes: drama.chapter_count,
    });
  } catch (error) {
    console.error("reelshort/detail error:", error);
    return encryptedResponse({ error: "Internal Server Error" }, 500);
  }
}
