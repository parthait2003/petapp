import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  pet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  veterinarian_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Veterinarian', required: true },
  service: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, default: 'pending' },
  notes: String
});

export default mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
