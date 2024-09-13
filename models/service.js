import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  service_name: { type: String, required: true },
  description: String,
  price: Number,
  service_type: String,
  veterinarian_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Veterinarian' }
});

export default mongoose.models.Service || mongoose.model('Service', serviceSchema);
