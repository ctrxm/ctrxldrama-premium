import { encryptedResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { getDrama } from "@/lib/sdrama";

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;

  try {
    const result = await getDrama(bookId);
    const drama = result.data?.drama;
    if (!drama) {
      return encryptedResponse({ error: "Not found" }, 404);
    }

    return encryptedResponse({
      bookId: String(drama.id),
      bookName: drama.title,
      coverWap: drama.cover_url,
      cover: drama.cover_url,
      chapterCount: drama.chapter_count,
      introduction: drama.introduction || "",
      shelfTime: drama.shelf_time || "",
      inLibrary: false,
      tagNames: (result.data?.tags || []).map((t) => t.name),
    });
  } catch (error) {
    console.error("dramabox/detail error:", error);
    return encryptedResponse({ error: "Internal Server Error" }, 500);
  }
}
