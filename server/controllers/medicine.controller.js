const mongoose = require("mongoose");
const Medicine = require("../schema/Medicine.schema");

exports.getAll = async (req, res) => {
  try {
    const { ownerId } = req.query;

    console.log("[medicine.getAll] fetching medicines", {
      dbName: mongoose.connection.name,
      collection: Medicine.collection.name,
      ownerId: ownerId || null,
    });

    const filter = {};
    if (ownerId) {
      filter.ownerId = ownerId;
    }

    const meds = await Medicine.find(filter);
    console.log("[medicine.getAll] count", meds.length);

    res.json({ success: true, data: meds });
  } catch (error) {
    console.error("[medicine.getAll] error", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    console.log("[medicine.create] incoming body", req.body);
    const med = await Medicine.create(req.body);
    console.log("[medicine.create] saved", {
      _id: med._id.toString(),
      name: med.name,
      batchNumber: med.batchNumber,
    });

    res.status(201).json({ success: true, data: med });
  } catch (error) {
    console.error("[medicine.create] error", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    console.log("[medicine.update] id", req.params.id, "body", req.body);
    const med = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    console.log("[medicine.update] updated", med?._id?.toString());
    res.json({ success: true, data: med });
  } catch (error) {
    console.error("[medicine.update] error", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    console.log("[medicine.delete] id", req.params.id);
    await Medicine.findByIdAndDelete(req.params.id);
    console.log("[medicine.delete] deleted");
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("[medicine.delete] error", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
