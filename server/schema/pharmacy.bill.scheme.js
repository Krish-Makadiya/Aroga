const mongoose = require("mongoose");

const BillItemSchema = new mongoose.Schema(
  {
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const PharmacyBillSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    ownerId: { type: String },
    items: { type: [BillItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    billDate: { type: Date, default: Date.now },
    day: { type: String },
    notes: { type: String },
    grossAmount: { type: Number },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PharmacyBill", PharmacyBillSchema);

