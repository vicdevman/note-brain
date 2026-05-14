import { auth } from "@/app/lib/auth";
import connectMongoose from "@/app/lib/mongoose";
import { Note } from "@/app/models/Note";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const permission = body.permission === "edit" ? "edit" : "view";

    await connectMongoose();
    const existing = await Note.findOne({ pouchId: id, userId: session.user.id });

    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const token = existing.share?.token || randomBytes(24).toString("hex");
    const note = await Note.findOneAndUpdate(
      { pouchId: id, userId: session.user.id },
      {
        $set: {
          share: {
            token,
            permission,
            enabled: true,
            createdAt: existing.share?.createdAt || new Date(),
          },
        },
      },
      { new: true },
    );

    const url = new URL(`/share/${token}`, request.url);
    return NextResponse.json({
      token,
      permission: note.share.permission,
      url: url.toString(),
    });
  } catch (error) {
    console.error("Error creating share link:", error);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}
