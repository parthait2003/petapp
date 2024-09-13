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

// GET: Retrieve a booking by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("GET request received for booking ID:", params.id);

  try {
    // Step 1: Connect to the database
    await connectDB();

    // Step 2: Find the booking by ID
    const booking = await bookingModel.findById(params.id);

    if (!booking) {
      const response = NextResponse.json(
        { message: "Booking Not Found" },
        { status: 404 }
      );
      await setCORSHeaders(response);
      return response;
    }

    console.log("Booking retrieved successfully:", booking);
    const response = NextResponse.json({ booking }, { status: 200 });
    await setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to retrieve booking:", error);
    const response = NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
    await setCORSHeaders(response);
    return response;
  }
}

// DELETE: Delete a booking by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("DELETE request received for booking ID:", params.id);

  try {
    await connectDB();

    const deletedBooking = await bookingModel.findByIdAndDelete(params.id);

    if (!deletedBooking) {
      const response = NextResponse.json(
        { message: "Booking Not Found" },
        { status: 404 }
      );
      await setCORSHeaders(response);
      return response;
    }

    console.log("Booking deleted successfully:", deletedBooking);
    const response = NextResponse.json(
      { message: "Booking Deleted", booking: deletedBooking },
      { status: 200 }
    );
    await setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to delete booking:", error);
    const response = NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
    await setCORSHeaders(response);
    return response;
  }
}

// PUT: Update booking status, rating, and feedback if status is "completed"
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("PUT request received to update booking for ID:", params.id);

  try {
    await connectDB();

    const body = await request.json();
    const { status, rating, feedback } = body;

    if (!status) {
      return NextResponse.json(
        { message: "Status field is required" },
        { status: 403 }
      );
    }

    // Step 1: Find the booking document first
    const booking = await bookingModel.findById(params.id);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking Not Found" },
        { status: 404 }
      );
    }

    // Step 2: Update status
    booking.status = status;

    // Step 3: Update rating and feedback only if status is "completed" and both are provided
    if (status === "completed") {
      if (rating !== undefined) {
        if (typeof rating === "number" && rating >= 1 && rating <= 5) {
          booking.rating = rating;
        } else {
          return NextResponse.json(
            { message: "Invalid rating value. Must be between 1 and 5." },
            { status: 401 }
          );
        }
      }

      if (feedback !== undefined) {
        if (typeof feedback === "string" && feedback.trim().length > 0) {
          booking.feedback = feedback;
        } else {
          return NextResponse.json(
            { message: "Feedback cannot be an empty string." },
            { status: 402 }
          );
        }
      }
    }

    // Step 4: Save the updated booking document
    const updatedBooking = await booking.save();

    console.log("Booking updated successfully:", updatedBooking);
    return NextResponse.json(
      { message: "Booking updated successfully", booking: updatedBooking },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update booking:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

