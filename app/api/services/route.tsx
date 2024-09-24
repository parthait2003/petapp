import mongoose from "mongoose";
import connectDB from "@/config/database";
import serviceModel from "@/models/service"; // Import Booking model
import { NextResponse, NextRequest } from "next/server";



async function setCORSHeaders(response: NextResponse) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "POST, GET, DELETE, PUT, OPTIONS"
    );
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return response;
  }
  
  export async function OPTIONS() {
    let response = NextResponse.json({}, { status: 200 });
    setCORSHeaders(response);
    return response;
  }
  
  export async function POST(request: Request) {
    try {
      const requestBody = await request.json();
      console.log("Received POST request data:", requestBody); 
  
      await connectDB();
      const newService = await serviceModel.create(requestBody);
  
      let response = NextResponse.json(
        { message: "Service Created" },
        { status: 201 }
      );
      setCORSHeaders(response);
      return response;
    } catch (error) {
      console.error("Failed to create service:", error);
      let response = NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
      setCORSHeaders(response);
      return response;
    }
  }
  
  export async function GET() {
    try {
      await connectDB();
      const services = await serviceModel.find({}, 'services subservices'); // Select only services and subservices
  
      let response = NextResponse.json({ services }, { status: 200 });
      setCORSHeaders(response);
      return response;
    } catch (error) {
      console.error("Failed to get services:", error);
      let response = NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
      setCORSHeaders(response);
      return response;
    }
  }
  
  
