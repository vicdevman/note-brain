import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import clientPromise from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Zod schema for input validation and sanitization
const signupSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters").trim()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate and sanitize inputs
    const validatedFields = signupSchema.safeParse(body);
    
    if (!validatedFields.success) {
      const errors = validatedFields.error.issues.map(err => err.message).join(", ");
      return NextResponse.json(
        { error: `Validation failed: ${errors}` },
        { status: 400 }
      );
    }

    const { email, password, name } = validatedFields.data;

    const client = await clientPromise;
    const db = client.db();

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      email: email
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email address" },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const result = await db.collection("users").insertOne({
      email: email,
      name: name,
      password: hashedPassword, // Store hashed password
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (result.acknowledged) {
      return NextResponse.json(
        { 
          success: true, 
          message: "User created successfully",
          userId: result.insertedId 
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
