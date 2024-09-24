import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  services: [
    {
      name: { type: String, required: true },
      
    }
  ],
  subservices: [
    {
      name: { type: String, required: false },
      regularprice: { type: String, required: false },
      sellprice: { type: String, required: false },
    }
  ]
});

// Check if the model is already compiled before defining it
const Services = mongoose.models.Services || mongoose.model('Services', serviceSchema);

export default Services;
