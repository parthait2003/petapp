import mongoose from "mongoose";
import connectDB from "@/config/database";
import bookingModel from "@/models/booking"; // Import Booking model
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

// GET: Retrieve all bookings
export async function GET() {
  console.log("GET request received");

  try {
    // Step 1: Connect to the database
    await connectDB();

    // Step 2: Find all bookings
    const bookings = await bookingModel.find();

    console.log("Bookings retrieved successfully:", bookings);

    // Step 3: Return the list of bookings in the response
    const response = NextResponse.json({ bookings }, { status: 200 });
    await setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to retrieve bookings:", error);

    // Step 4: Handle any errors
    const response = NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
    await setCORSHeaders(response);
    return response;
  }
}

// POST: Create a new booking
export async function POST(request: NextRequest) {
  console.log("POST request received");

  try {
    // Step 1: Parse the request body
    const requestBody = await request.json();
    console.log("Request body:", requestBody);

    const {
      selectedService,
      selectedSubService,
      ownerId,
      petId,
      questions,
      bookingDate,
      selectedTimeSlot,
      status, // Now accepting status from the request body
      rating, // Optionally accept rating if status is "completed"
      feedback, // Optionally accept feedback if status is "completed"
    } = requestBody;

    // Step 2: Connect to the database
    await connectDB();

    // Step 3: Create a new booking
    const newBookingData = {
      selectedService,
      selectedSubService,
      ownerId,
      petId,
      questions,
      bookingDate,
      selectedTimeSlot,
      status: status || "pending", // Default status is "pending"
      rating,
      feedback,
    };

    // If the status is "completed", include rating and feedback
    if (status === "completed") {
      if (rating !== undefined) {
        newBookingData.rating = rating;
      }
      if (feedback !== undefined) {
        newBookingData.feedback = feedback;
      }
    }

    const newBooking = await bookingModel.create(newBookingData);

    console.log("Booking created successfully:", newBooking);

    // Step 4: Return success response
    const response = NextResponse.json(
      { message: "Booking Created", booking: newBooking },
      { status: 201 }
    );
    await setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to create booking:", error);

    // Step 5: Handle validation errors or other errors
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



