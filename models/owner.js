import mongoose from 'mongoose';

// Define the Address schema
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true }
});

// Define the Owner schema
const ownerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneno: { type: String, required: true },
  password: { type: String, required: true }, // Hashed password (using MD5 in your case)
  address: { type: addressSchema, required: true }, // Embed the addressSchema
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }] // Reference to the Pet model
});

// Create or retrieve the Owner model
const Owner = mongoose.models.Owner || mongoose.model('Owner', ownerSchema);

export default Owner;
