import connectMongoose from "@/app/lib/mongoose";
import { Note } from "@/app/models/Note";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    await connectMongoose();

    const note = await Note.findOne({ "share.token": token, "share.enabled": true }).select(
      "pouchId title content updatedAt share.permission",
    );

    if (!note) {
      return NextResponse.json({ error: "Shared note not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: note.pouchId,
      title: note.title,
      content: note.content,
      updatedAt: note.updatedAt,
      permission: note.share.permission,
    });
  } catch (error) {
    console.error("Error fetching shared note:", error);
    return NextResponse.json({ error: "Failed to fetch shared note" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const body = await request.json();

    await connectMongoose();
    const sharedNote = await Note.findOne({ "share.token": token, "share.enabled": true });

    if (!sharedNote) {
      return NextResponse.json({ error: "Shared note not found" }, { status: 404 });
    }

    if (sharedNote.share?.permission !== "edit") {
      return NextResponse.json({ error: "This link is view only" }, { status: 403 });
    }

    const content = Array.isArray(body.content) ? body.content : [];
    const firstBlock = content[0];
    const title =
      Array.isArray(firstBlock?.content)
        ? firstBlock.content.map((item: any) => item.text).join("").trim() || sharedNote.title
        : sharedNote.title;

    sharedNote.title = title || "Untitled";
    sharedNote.content = content;
    sharedNote.updatedAt = new Date();
    await sharedNote.save();

    return NextResponse.json({
      id: sharedNote.pouchId,
      title: sharedNote.title,
      content: sharedNote.content,
      updatedAt: sharedNote.updatedAt,
      permission: sharedNote.share.permission,
    });
  } catch (error) {
    console.error("Error updating shared note:", error);
    return NextResponse.json({ error: "Failed to update shared note" }, { status: 500 });
  }
}
