import mongoose from "mongoose";
import connectDB from "@/config/database";
import serviceModel from "@/models/service"; // Import Service model
import { NextResponse, NextRequest } from "next/server";
import veterinarianModel from '@/models/veterinarian';

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

// GET: Retrieve all services
export async function GET() {
    console.log("GET request received");
  
    // Step 1: Connect to the database
    await connectDB();
  
    // Log registered Mongoose models to ensure the Service model is loaded
    console.log("Mongoose Models:", mongoose.modelNames());
  
    try {
      // Step 2: Find all services and populate the veterinarian
      const services = await serviceModel.find().populate({
        path: "veterinarian_id",
        model: "Veterinarian",
        select: "-__v", // Exclude the '__v' field
      });
  
      // Log the populated services for debugging
      console.log("Populated Services:", services);
  
      // Step 3: Return the list of services in the response
      const response = NextResponse.json({ services }, { status: 200 });
      await setCORSHeaders(response);
      return response;
    } catch (error) {
      console.error("Failed to get services:", error);
  
      // Step 4: Handle any errors
      const response = NextResponse.json(
        { message: "Internal Server Error", error: error.message },
        { status: 500 }
      );
      await setCORSHeaders(response);
      return response;
    }
  }
  

// POST: Create a new service
export async function POST(request: NextRequest) {
  console.log("POST request received");
  try {
    const requestBody = await request.json();
    console.log("Request body:", requestBody);

    const { service_name, description, price, service_type, veterinarian_id } = requestBody;

    // Step 1: Connect to the database
    await connectDB();

    // Step 2: Create a new service
    const newService = await serviceModel.create({
      service_name,
      description,
      price,
      service_type,
      veterinarian_id,
    });

    console.log("Service created successfully:", newService);

    // Step 3: Return success response
    const response = NextResponse.json(
      { message: "Service Created", service: newService },
      { status: 201 }
    );
    await setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to create service:", error);

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
