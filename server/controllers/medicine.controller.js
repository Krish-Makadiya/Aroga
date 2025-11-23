const mongoose = require("mongoose");
const Medicine = require("../schema/Medicine.schema");

exports.getAll = async (req, res) => {
  try {
    const { ownerId } = req.query;

    const filter = {};
    if (ownerId) {
      filter.ownerId = ownerId;
    }

    const meds = await Medicine.find(filter);

    res.json({ success: true, data: meds });
  } catch (error) {
    console.error("[medicine.getAll] error", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const med = await Medicine.create(req.body);

    res.status(201).json({ success: true, data: med });
  } catch (error) {
    console.error("[medicine.create] error", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const med = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: med });
  } catch (error) {
    console.error("[medicine.update] error", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("[medicine.delete] error", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
