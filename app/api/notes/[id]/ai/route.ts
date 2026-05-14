import { auth } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  return NextResponse.json(
    {
      error: "AI endpoint not implemented",
      request: {
        userId: session.user.id,
        noteId: id,
        query: body.query ?? "",
        noteTitle: body.noteTitle ?? "",
        noteBlocks: body.noteBlocks ?? [],
        messages: body.messages ?? [],
      },
    },
    { status: 501 },
  );
}
