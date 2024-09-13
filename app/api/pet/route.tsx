import petModel from "@/models/pet";
import ownerModel from "@/models/owner"; // Assuming you have an owner model in this path
import connectDB from "@/config/database";
import { NextResponse, NextRequest } from "next/server";

// Utility function to set CORS headers
async function setCORSHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "POST, GET, DELETE, PUT, OPTIONS"
  );
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

// POST request to create a new pet and update the owner's pets array
export async function POST(request: NextRequest) {
  //console.log("POST request received");

  try {
    // Parse request body
    const requestBody = await request.json();
    console.log("Incoming request body:", requestBody);

    const {
      name,

      species,
      breed,
      date_of_birth,
      gender,
      weight,
      size_of_pet,
      aggressive,
      owner, // Owner's _id
      vaccination_records, // Could be "No" or records
      vaccine_name,
      date_administered,
      insurance_policy,
      policy_number,
      provider,
      coverage_start_date,
      coverage_end_date,
      annual_limit,
      coverage_type,
      weight_taken_date,
    } = requestBody;

    // Connect to the database
    await connectDB();

    // Handle vaccination records
    let processedVaccinationRecords = [];
    if (vaccination_records === "Yes" && vaccine_name && date_administered) {
      processedVaccinationRecords.push({
        vaccine_name,
        date_administered: date_administered
          ? new Date(date_administered.split("/").reverse().join("-"))
          : null,
      });
    }

    // Handle insurance policy
    let processedInsurancePolicy = null;
    if (insurance_policy === "Yes") {
      processedInsurancePolicy = {
        policy_number: policy_number || "", // Fallback to empty string if undefined
        provider: provider || "", // Fallback to empty string if undefined
        coverage_start_date: coverage_start_date
          ? new Date(coverage_start_date.split("/").reverse().join("-"))
          : null,
        coverage_end_date: coverage_end_date
          ? new Date(coverage_end_date.split("/").reverse().join("-"))
          : null,
        annual_limit: Number(annual_limit) || 0,
        coverage_type: coverage_type || "Basic", // Fallback to "Basic" if undefined
      };
    }

    // Create a new pet in the database
    const newPet = await petModel.create({
      name,

      species,
      breed,
      date_of_birth: date_of_birth,
      gender,
      weight: Number(weight), // Ensure weight is a number
      weight_taken_date: weight_taken_date,
      size_of_pet,
      aggressive,
      owner, // Reference to the owner's ObjectId
      vaccination_records: processedVaccinationRecords, // Empty if no vaccination
      insurance_policy: processedInsurancePolicy, // Null if no insurance
    });

    //console.log("New pet created:", newPet); // Log the created pet

    // Update the owner's pets array by adding the new pet's _id
    const updatedOwner = await ownerModel.findByIdAndUpdate(
      owner, // Owner's _id
      { $push: { pets: newPet._id } }, // Push the new pet's _id into the pets array
      { new: true } // Return the updated owner document
    );

    // console.log("Owner updated with new pet:", updatedOwner); // Log the updated owner

    // Respond with success
    const response = NextResponse.json(
      { message: "Pet created successfully", newPet, updatedOwner },
      { status: 201 }
    );
    return setCORSHeaders(response);
  } catch (error) {
    console.error("Failed to create pet:", error);

    // Handle validation errors
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

    return setCORSHeaders(response);
  }
}

// GET request to fetch all pets
export async function GET(request: NextRequest) {
  // console.log("GET request received");

  try {
    // Connect to the database
    await connectDB();

    // Fetch all pets from the database and populate owner's _id
    const pets = await petModel
      .find()
      .populate("owner", "_id name") // Populate the owner's _id and name fields
      .exec(); // Execute the query

    // console.log("Fetched pets from the database:", pets); // Log fetched pets

    // Respond with the list of pets
    const response = NextResponse.json({ pets }, { status: 200 });
    return setCORSHeaders(response);
  } catch (error) {
    console.error("Failed to get pets:", error);

    // Respond with an error if something goes wrong
    const response = NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
    return setCORSHeaders(response);
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  // console.log("OPTIONS request received");
  const response = NextResponse.json({}, { status: 200 });
  return setCORSHeaders(response);
}
