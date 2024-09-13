import connectDB from "@/config/database";
import Owner from "@/models/owner";
import { NextRequest, NextResponse } from "next/server";

// Function to set CORS headers
async function setCORSHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "POST, GET, DELETE, OPTIONS, PUT"
  );
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  let response = NextResponse.json({}, { status: 200 });
  setCORSHeaders(response);
  return response;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectDB();
    const owner = await Owner.findById(id);

    if (!owner) {
      let response = NextResponse.json(
        { message: "Owner not found" },
        { status: 404 }
      );
      setCORSHeaders(response);
      return response;
    }

    let response = NextResponse.json({ owner }, { status: 200 });
    setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to get owner:", error);
    let response = NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
    setCORSHeaders(response);
    return response;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const {
      
      name,
      address,
      phoneno,
      email,
      date,
     
    } = await request.json();

    await connectDB();

    const updatedOwner = await Owner.findByIdAndUpdate(
      id,
      {
         name,
         address,
         phoneno,
         email,
         date,
        // date is intentionally omitted to prevent it from being updated
      },
      { new: true }
    );

    if (!updatedOwner) {
      let response = NextResponse.json(
        { message: "Owner not found" },
        { status: 404 }
      );
      setCORSHeaders(response);
      return response;
    }

    let response = NextResponse.json(
      { message: "Owner updated", updatedOwner },
      { status: 200 }
    );
    setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to update owner:", error);
    let response = NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
    setCORSHeaders(response);
    return response;
  }
}



export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectDB();
    const deletedOwner = await Owner.findByIdAndDelete(id);

    if (!deletedOwner) {
      let response = NextResponse.json(
        { message: "Owner not found" },
        { status: 404 }
      );
      setCORSHeaders(response);
      return response;
    }

    let response = NextResponse.json(
      { message: "Owner Deleted" },
      { status: 200 }
    );
    setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to delete owner:", error);
    let response = NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
    setCORSHeaders(response);
    return response;
  }
}


