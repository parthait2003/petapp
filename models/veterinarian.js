import mongoose from 'mongoose';

// Schema for clinic address
const clinicAddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
});

// Schema for available time per day
const availableTimeSchema = new mongoose.Schema({
  start: { type: String },  // Optional start time (e.g., '09:00')
  end: { type: String },    // Optional end time (e.g., '17:00')
  notAvailable: { type: Boolean, default: true },  // Boolean indicating availability
}, { _id: true });  // Enable automatic _id generation for each subdocument

// Schema for veterinarian
const veterinarianSchema = new mongoose.Schema({
  name: { type: String, required: true },
  degree: { type: String, required: true },
  specialization: [{ type: String, required: true }],  // Array of specializations, required
  clinics: [{
    clinic_name: { type: String, required: true },
    clinic_address: { type: clinicAddressSchema, required: true },
  }],
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],  // Array of ObjectId references to Appointment model
  
  availableTime: {  // Availability for each day of the week
    Monday: { type: availableTimeSchema, default: () => ({}) },
    Tuesday: { type: availableTimeSchema, default: () => ({}) },
    Wednesday: { type: availableTimeSchema, default: () => ({}) },
    Thursday: { type: availableTimeSchema, default: () => ({}) },
    Friday: { type: availableTimeSchema, default: () => ({}) },
    Saturday: { type: availableTimeSchema, default: () => ({}) },
    Sunday: { type: availableTimeSchema, default: () => ({}) },
  },
});

export default mongoose.models.Veterinarian || mongoose.model('Veterinarian', veterinarianSchema);
