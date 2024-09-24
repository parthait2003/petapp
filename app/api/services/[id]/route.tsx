import mongoose from "mongoose";
import connectDB from "@/config/database";
import serviceModel from "@/models/service";
import { NextResponse, NextRequest } from "next/server";

// Set CORS headers function
async function setCORSHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "POST, GET, DELETE, PUT, OPTIONS"
  );
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

// GET method to retrieve a service by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    const service = await serviceModel.findById(id);
    if (!service) {
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );
    }

    let response = NextResponse.json({ service }, { status: 200 });
    setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to get service by ID:", error);
    let response = NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
    setCORSHeaders(response);
    return response;
  }
}

// PUT method to update a service by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const requestBody = await request.json();

    const updatedService = await serviceModel.findByIdAndUpdate(id, requestBody, { new: true });
    if (!updatedService) {
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );
    }

    let response = NextResponse.json(
      { message: "Service Updated", service: updatedService },
      { status: 200 }
    );
    setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to update service:", error);
    let response = NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
    setCORSHeaders(response);
    return response;
  }
}

// DELETE method to remove a service by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    const deletedService = await serviceModel.findByIdAndDelete(id);
    if (!deletedService) {
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );
    }

    let response = NextResponse.json(
      { message: "Service Deleted" },
      { status: 200 }
    );
    setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to delete service:", error);
    let response = NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
    setCORSHeaders(response);
    return response;
  }
}

// Handle OPTIONS request (CORS preflight)
export async function OPTIONS() {
  let response = NextResponse.json({}, { status: 200 });
  setCORSHeaders(response);
  return response;
}
