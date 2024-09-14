import connectDB from "@/config/database";
import ownerModel from "@/models/owner";
import crypto from "crypto";
import { NextResponse } from "next/server";

// Utility function to hash passwords using MD5
function hashPassword(password: string): string {
  return crypto.createHash("md5").update(password).digest("hex");
}

// Utility function to set CORS headers
const setCORSHeaders = (response: NextResponse) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "POST, GET, DELETE, PUT, OPTIONS"
  );
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
};

// POST: Check login credentials (User Login)
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json(); // Extract email and password from request body

    // Basic validation for required fields
    if (!email || !password) {
      return setCORSHeaders(
        NextResponse.json(
          { message: "Email and password are required" },
          { status: 400 }
        )
      );
    }

    await connectDB();

    // Find the owner by email
    const owner = await ownerModel.findOne({ email });

    if (!owner) {
      return setCORSHeaders(
        NextResponse.json(
          { message: "No account found with this email" },
          { status: 404 }
        )
      );
    }

    // Hash the provided password using MD5
    const hashedPassword = hashPassword(password);

    // Compare the hashed password with the stored password in the database
    if (hashedPassword !== owner.password) {
      return setCORSHeaders(
        NextResponse.json({ message: "Invalid password" }, { status: 401 })
      );
    }

    // Successful login response
    const response = NextResponse.json(
      {
        message: "Login successful",
        owner: {
          id: owner._id,
          name: owner.name,
          email: owner.email,
        },
      },
      { status: 200 }
    );
    setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Login error:", error);

    // Internal server error handling
    const response = NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
    setCORSHeaders(response);
    return response;
  }
}
