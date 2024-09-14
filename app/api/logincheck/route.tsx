// logincheck/route.tsx
import connectDB from "@/config/database"; // DB connection utility
import ownerModel from "@/models/owner"; // Import the Owner model
import bcrypt from "bcryptjs"; // Use bcryptjs for password comparison
import { NextResponse } from "next/server";

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

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = NextResponse.json({}, { status: 200 });
  setCORSHeaders(response);
  return response;
}

// POST: Check login credentials
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json(); // Extract email and password from request body

    // Validate email and password presence
    if (!email || !password) {
      return setCORSHeaders(
        NextResponse.json(
          { message: "Email and password are required" },
          { status: 400 }
        )
      );
    }

    await connectDB(); // Connect to the database

    // Find the owner by email
    const owner = await ownerModel.findOne({ email });

    // If no owner is found
    if (!owner) {
      return setCORSHeaders(
        NextResponse.json({ message: "No account found with this email" }, { status: 404 })
      );
    }

    // Compare the password with the hashed password
    const isMatch = await bcrypt.compare(password, owner.password);

    // If the password does not match
    if (!isMatch) {
      return setCORSHeaders(
        NextResponse.json({ message: "Invalid password" }, { status: 401 })
      );
    }

    // Successful login
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
