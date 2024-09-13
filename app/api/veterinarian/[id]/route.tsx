import mongoose from "mongoose";
import veterinarianModel from "@/models/veterinarian"; // Import Veterinarian model
import appointmentModel from "@/models/appointment"; // Import Appointment model
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

// GET: Retrieve a specific veterinarian by id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("GET request received for veterinarian id:", params.id);

  // Step 1: Connect to the database
  await connectDB();

  try {
    // Step 2: Find the veterinarian by id and populate their appointments
    const veterinarian = await veterinarianModel.findById(params.id).populate({
      path: "appointments",
      model: appointmentModel, // Ensure the Appointment model is passed to the populate method
      select: "-__v", // Exclude the '__v' field from appointments
    });

    if (!veterinarian) {
      const response = NextResponse.json(
        { message: "Veterinarian not found" },
        { status: 404 }
      );
      await setCORSHeaders(response);
      return response;
    }

    // Step 3: Return the veterinarian details in the response
    const response = NextResponse.json({ veterinarian }, { status: 200 });
    await setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to get veterinarian:", error);

    // Step 4: Handle any errors
    const response = NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
    await setCORSHeaders(response);
    return response;
  }
}

// PUT: Update a specific veterinarian by id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("PUT request received for veterinarian id:", params.id);

  try {
    const requestBody = await request.json();
    console.log("Request body:", requestBody);

    const {
      name,
      degree,
      specialization,
      clinics,
      appointments,
      availableTime,
    } = requestBody;

    // Step 1: Connect to the database
    await connectDB();

    // Step 2: Update the veterinarian
    const updatedVeterinarian = await veterinarianModel.findByIdAndUpdate(
      params.id,
      {
        name,
        degree,
        specialization, // Array of specializations
        clinics, // Array of clinic objects
        appointments, // Array of appointment ObjectIds
        availableTime, // Availability schedule
      },
      { new: true, runValidators: true }
    );

    if (!updatedVeterinarian) {
      const response = NextResponse.json(
        { message: "Veterinarian not found" },
        { status: 404 }
      );
      await setCORSHeaders(response);
      return response;
    }

    console.log("Veterinarian updated successfully:", updatedVeterinarian);

    // Step 3: Return success response
    const response = NextResponse.json(
      { message: "Veterinarian Updated", veterinarian: updatedVeterinarian },
      { status: 200 }
    );
    await setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to update veterinarian:", error);

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

// DELETE: Delete a specific veterinarian by id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("DELETE request received for veterinarian id:", params.id);

  try {
    const { id } = params;

    // Step 1: Connect to the database
    await connectDB();

    // Step 2: Find and delete the veterinarian
    const deletedVeterinarian = await veterinarianModel.findByIdAndDelete(id);

    if (!deletedVeterinarian) {
      const response = NextResponse.json(
        { message: "Veterinarian not found" },
        { status: 404 }
      );
      await setCORSHeaders(response);
      return response;
    }

    console.log("Veterinarian deleted successfully:", deletedVeterinarian);

    // Step 3: Return success response
    const response = NextResponse.json(
      { message: "Veterinarian Deleted" },
      { status: 200 }
    );
    await setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to delete veterinarian:", error);

    // Step 4: Handle any errors
    const response = NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
    await setCORSHeaders(response);
    return response;
  }
}
