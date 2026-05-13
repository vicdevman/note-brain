import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { z } from "zod";

const checkUserSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedFields = checkUserSchema.safeParse(body);
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const { email } = validatedFields.data;

    const client = await clientPromise;
    const db = client.db();

    // Check if user exists
    const user = await db.collection("users").findOne({
      email: email
    });

    return NextResponse.json({
      exists: !!user,
      hasPassword: !!user?.password
    });

  } catch (error) {
    console.error("Check user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
