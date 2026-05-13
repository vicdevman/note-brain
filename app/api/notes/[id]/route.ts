import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { Note } from "@/app/models/Note";
import clientPromise from "@/app/lib/mongodb";

// GET /api/notes/[id] - Get a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    const note = await Note.findOne({ _id: params.id, userId: session.user.id });
    
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

// PATCH /api/notes/[id] - Update a specific note
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content } = await request.json();
    
    
    const note = await Note.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { 
        title: title || "Untitled",
        content: content || [],
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

// DELETE /api/notes/[id] - Delete a specific note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    const note = await Note.findOneAndDelete({ _id: params.id, userId: session.user.id });
    
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
