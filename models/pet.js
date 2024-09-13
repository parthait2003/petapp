import mongoose from 'mongoose';
import { format } from 'date-fns';

// Define the Vaccination Record schema
const vaccinationRecordSchema = new mongoose.Schema({
  vaccine_name: { type: String, required: true },
  date_administered: { type: Date, required: true },
  veterinarian_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Veterinarian' } // Optional: Reference Veterinarian
});

// Define the Health Record schema
const healthRecordSchema = new mongoose.Schema({
  checkup_date: { type: Date, required: true },
  description: { type: String, required: true },
  notes: { type: String },
  veterinarian_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Veterinarian' } // Optional: Reference Veterinarian
});

// Define the Insurance Policy schema
const insurancePolicySchema = new mongoose.Schema({
  policy_number: { type: String, required: true },
  provider: { type: String, required: true },
  coverage_start_date: { type: String, required: true },
  coverage_end_date: { type: String, required: true },
  annual_limit: { type: Number, required: true },
  coverage_type: { type: String, required: true, enum: ['Comprehensive', 'Basic', 'Accident Only'] }
});

// Define the Pet schema
const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  species: { type: String, required: true }, // Can be 'Dog', 'Cat', etc.
  breed: { type: String }, // Optional if 'species' is "Others"
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  date_of_birth: { type: String }, // Stores the pet's birth date
  weight_taken_date: { type: String },
  weight: { type: Number }, // Weight in kgs
  aggressive: { type: String, enum: ['Yes', 'No', 'Moderate'] }, // Aggressiveness level
  size_of_pet: { type: String, enum: ['Small', 'Medium', 'Large', 'Giant'] }, // Pet size category
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true }, // Owner reference
  vaccination_records: [vaccinationRecordSchema], // Array of vaccination records
  insurance_policy: insurancePolicySchema, // Optional insurance policy object
  submission_date: { type: String }, // Submission date in dd/MM/yyyy format
}, {
  timestamps: true // Optional: Adds createdAt and updatedAt fields
});

// Mongoose pre-save hook to set the submission_date to current date in dd/MM/yyyy format
petSchema.pre('save', function (next) {
  const pet = this;
  
  // Set submission_date to the current date in dd/MM/yyyy format
  if (!pet.submission_date) {
    pet.submission_date = format(new Date(), 'dd/MM/yyyy');
  }

  next();
});

export default mongoose.models.Pet || mongoose.model('Pet', petSchema);
