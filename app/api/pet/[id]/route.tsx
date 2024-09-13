import petModel from "@/models/pet";
import ownerModel from "@/models/owner"; // If you handle owner updates when deleting pets
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

// GET request to fetch a single pet by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectDB();

    // Find the pet by ID and populate the owner's _id and name
    const pet = await petModel.findById(id).populate("owner", "_id name");

    if (!pet) {
      let response = NextResponse.json(
        { message: "Pet not found" },
        { status: 404 }
      );
      setCORSHeaders(response);
      return response;
    }

    let response = NextResponse.json({ pet }, { status: 200 });
    setCORSHeaders(response);
    return response;
  } catch (error) {
    console.error("Failed to get pet:", error);
    let response = NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
    setCORSHeaders(response);
    return response;
  }
}

// PUT request to update an existing pet
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("PUT request received for updating pet");

  try {
    // Parse request body
    const requestBody = await request.json();
    console.log("Incoming request body for update:", requestBody);

    const {
      name,
      species,
      breed,
      date_of_birth,
      gender,
      size_of_pet,
      aggressive,
      age,
      weight,
      owner, // Ensure owner._id is provided and updated
      vaccination_records,
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
        policy_number: policy_number || "",
        provider: provider || "",
        coverage_start_date: coverage_start_date
          ? new Date(coverage_start_date.split("/").reverse().join("-"))
          : null,
        coverage_end_date: coverage_end_date
          ? new Date(coverage_end_date.split("/").reverse().join("-"))
          : null,
        annual_limit: Number(annual_limit) || 0,
        coverage_type: coverage_type || "Basic",
      };
    }

    // Find and update the pet
    const updatedPet = await petModel
      .findByIdAndUpdate(
        params.id,
        {
          name,
          species,
          breed,
          age: Number(age),
          weight: Number(weight),
          owner, // Update owner._id if provided
          vaccination_records: processedVaccinationRecords,
          insurance_policy: processedInsurancePolicy,
          date_of_birth,
          weight_taken_date,
          gender,
          size_of_pet,
          aggressive,
        },
        { new: true, runValidators: true } // Return the updated document
      )
      .populate("owner", "_id name"); // Populate the updated owner

    if (!updatedPet) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 });
    }

    console.log("Pet updated successfully:", updatedPet);

    // Respond with success
    const response = NextResponse.json(
      { message: "Pet updated successfully", updatedPet },
      { status: 200 }
    );
    return setCORSHeaders(response);
  } catch (error) {
    console.error("Failed to update pet:", error);

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

// DELETE request to delete an existing pet
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("DELETE request received for deleting pet");

  try {
    await connectDB();

    // Find and delete the pet
    const deletedPet = await petModel.findByIdAndDelete(params.id);

    if (!deletedPet) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 });
    }

    // Optionally remove pet reference from owner's pets array
    await ownerModel.findByIdAndUpdate(deletedPet.owner, {
      $pull: { pets: deletedPet._id },
    });

    console.log("Pet deleted successfully:", deletedPet);

    // Respond with success
    const response = NextResponse.json(
      { message: "Pet deleted successfully", deletedPet },
      { status: 200 }
    );
    return setCORSHeaders(response);
  } catch (error) {
    console.error("Failed to delete pet:", error);

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
  console.log("OPTIONS request received");
  const response = NextResponse.json({}, { status: 200 });
  return setCORSHeaders(response);
}
