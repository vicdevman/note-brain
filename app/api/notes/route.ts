import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { Note } from "@/app/models/Note";
import clientPromise from "@/app/lib/mongodb";

// GET /api/notes - Get all notes for the authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  
    const notes = await Note.find({ userId: session.user.id }).sort({ updatedAt: -1 });
    
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/notes called');
    
    const session = await auth();
    console.log('Session:', session);
    
    if (!session?.user?.id) {
      console.log('No session or user ID');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content } = await request.json();
    console.log('Request body:', { title, content });
    
  
    console.log('MongoDB connected');
    
    const note = await Note.create({
      title: title || "Untitled",
      content: content || [{ type: "paragraph", content: [] }],
      userId: session.user.id,
    });

    console.log('Note created:', note);
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
