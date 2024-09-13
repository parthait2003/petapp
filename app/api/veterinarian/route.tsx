import mongoose from "mongoose";
import veterinarianModel from "@/models/veterinarian"; // Import Veterinarian model
import appointmentModel from "@/models/appointment"; // Import Appointment model to ensure it's registered
import connectDB from "@/config/database";
import { NextResponse, NextRequest } from "next/server";

// Function to set CORS headers
async function setCORSHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "POST, GET, DELETE, PUT, OPTIONS"
  );
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  console.log("OPTIONS request received");
  const response = NextResponse.json({}, { status: 200 });
  await setCORSHeaders(response);
  return response;
}

// GET: Retrieve all veterinarians
export async function GET() {
  console.log("GET request received");

  // Step 1: Connect to the database
  await connectDB();

  // Log registered Mongoose models to ensure both Veterinarian and Appointment models are loaded
  console.log("Mongoose Models:", mongoose.modelNames());

  try {
    // Step 2: Find all veterinarians and populate their appointments
    const veterinarians = await veterinarianModel.find().populate({
      path: "appointments",
      model: appointmentModel, // Ensure the Appointment model is passed to the populate method
      select: "-__v", // Exclude the '__v' field from appointments
    });

    // Step 3: Return the list of veterinarians in the response
    const response = NextResponse.json({ veterinarians }, { status: 200 });
    await setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to get veterinarians:", error);

    // Step 4: Handle any errors
    const response = NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
    await setCORSHeaders(response);
    return response;
  }
}

// POST: Create a new veterinarian
export async function POST(request: NextRequest) {
  console.log("POST request received");
  try {
    const requestBody = await request.json();
    console.log("Request body:", requestBody);

    const {
      name,
      degree,
      specialization,
      clinics,
      appointments,
      availableTime, // Include the availableTime field
    } = requestBody;

    // Step 1: Connect to the database
    await connectDB();

    // Step 2: Create a new veterinarian
    const newVeterinarian = await veterinarianModel.create({
      name,
      degree,
      specialization, // Expecting an array of specializations
      clinics, // Expecting an array of clinic objects
      appointments, // Array of appointment ObjectIds
      availableTime, // Include availableTime in the creation process
    });

    console.log("Veterinarian created successfully:", newVeterinarian);

    // Step 3: Return success response
    const response = NextResponse.json(
      { message: "Veterinarian Created", veterinarian: newVeterinarian },
      { status: 201 }
    );
    await setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to create veterinarian:", error);

    // Step 4: Handle validation errors or other errors
    let response;
    if (error.name === "ValidationError") {
      response = NextResponse.json(
        { message: "Validation Error", errors: error.errors },
        { status: 400 }
      );
    } else {
      response = NextResponse.json(
        { message: "Internal Server Error", error: error.message },
        { status: 500 }
      );
    }

    await setCORSHeaders(response);
    return response;
  }
}
