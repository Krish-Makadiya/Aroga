const mongoose = require("mongoose");

const MedicineSchema = new mongoose.Schema({
  name: String,
  category: String,
  manufacturer: String,
  batchNumber: String,
  expiryDate: String,
  quantity: Number,
  minStockLevel: Number,
  price: Number,
  mrp: Number,
  description: String,
  status: String,
  // Link to Pharmacy _id so we know which medical store has this medicine
  ownerId: String,
});

module.exports = mongoose.model("Medicine", MedicineSchema);
