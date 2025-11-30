const mongoose = require("mongoose");

const PharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,

  // GeoJSON — required for geospatial search
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },

  ownerId: String, // optional if pharmacist login
  createdAt: { type: Date, default: Date.now }
});

// Important index: enables $near search
PharmacySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("PharmacyLocation", PharmacySchema);
