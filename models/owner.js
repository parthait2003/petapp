import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing

// Define address schema
const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  zip: String,
  country: String
});

// Define owner schema
const ownerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Email should be unique
  phoneno: { type: String, required: true },
  password: { type: String, required: true }, // Add password field
  address: addressSchema,
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }] // Reference to Pet model
});

// Add pre-save middleware to hash password before saving
ownerSchema.pre('save', async function (next) {
  const owner = this;
  
  if (!owner.isModified('password')) return next(); // Only hash if the password is modified

  try {
    const salt = await bcrypt.genSalt(10);
    owner.password = await bcrypt.hash(owner.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

// Method to compare password during login
ownerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create or retrieve the model
const Owner = mongoose.models.Owner || mongoose.model('Owner', ownerSchema);

export default Owner;
