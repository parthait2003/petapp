import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  selectedService: { type: String, required: true },
  selectedSubService: { type: String, required: false },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true },
  petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  questions: {
    eats: { type: String, required: true },
    vaccinationCard: { type: String, required: true },
    illness: { type: String, required: true },
    allergy: { type: String, required: true },
  },
  bookingDate: { type: String, required: true }, // Storing as a string in dd/mm/yyyy format
  selectedTimeSlot: { type: String, required: true },
  status: { type: String, default: "pending" }, // Default status is "pending"
  
  rating: {
    type: Number,
    min: 1,
    max: 5,
    validate: {
      validator: function(value) {
        // Validate rating only if status is "completed"
        if (this.status !== "completed" && value !== undefined) {
          return false;
        }
        return true;
      },
      message: "Rating can only be set if the booking status is completed."
    }
  },
  feedback: {
    type: String,
    validate: {
      validator: function(value) {
        // Validate feedback only if status is completed
        if (this.status !== "completed" && value !== undefined && value.length > 0) {
          return false;
        }
        return true;
      },
      message: "Feedback can only be set if the booking status is completed."
    }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Pre-update hook to validate fields based on status during update
bookingSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  // If the status is not completed, do not allow rating or feedback to be updated
  if (update.status !== "completed") {
    delete update.rating;
    delete update.feedback;
  }

  next();
});

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
