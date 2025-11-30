const PharmacyBill = require("../schema/pharmacy.bill.scheme");
const Medicine = require("../schema/Medicine.schema");

const getDayName = (date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
};

exports.createBill = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      ownerId,
      items,
      notes,
      discountPercent,
    } = req.body;

    if (!customerName || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "customerName and at least one item are required",
      });
    }

    const normalizedItems = items.map((item) => ({
      name: (item.name || "").trim(),
      batchNumber: item.batchNumber || "",
      quantity: Number(item.quantity) || 0,
    }));

    if (normalizedItems.some((i) => !i.name || i.quantity <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Each item must have name and quantity > 0",
      });
    }

    const names = [...new Set(normalizedItems.map((i) => i.name))];

    const medFilter = {
      name: { $in: names },
    };
    if (ownerId) {
      medFilter.ownerId = ownerId;
    }

    const medicines = await Medicine.find(medFilter);

    const medicineMap = new Map();
    medicines.forEach((m) => {
      const key = `${m.name}|${m.batchNumber || ""}`;
      if (!medicineMap.has(key)) {
        medicineMap.set(key, m);
      }
    });

    const billItems = [];
    let totalAmount = 0;
    const bulkOps = [];

    for (const item of normalizedItems) {
      const key = `${item.name}|${item.batchNumber || ""}`;
      let med = medicineMap.get(key);

      if (!med) {
        med = medicines.find((m) => m.name === item.name);
      }

      if (!med) {
        return res.status(404).json({
          success: false,
          message: `Medicine "${item.name}" not found. Please check spelling or select from suggestions.`,
          name: item.name,
        });
      }

      if (typeof med.quantity === "number" && med.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock for medicine",
          name: item.name,
        });
      }

      const pricePerUnit = med.price || 0;
      const lineTotal = pricePerUnit * item.quantity;
      totalAmount += lineTotal;

      billItems.push({
        medicine: med._id,
        name: med.name || "",
        quantity: item.quantity,
        pricePerUnit,
        lineTotal,
      });

      bulkOps.push({
        updateOne: {
          filter: { _id: med._id },
          update: { $inc: { quantity: -item.quantity } },
        },
      });
    }

    const grossAmount = totalAmount;
    let discountValue = Number(discountPercent);
    if (Number.isNaN(discountValue) || discountValue < 0) {
      discountValue = 0;
    }
    if (discountValue > 100) {
      discountValue = 100;
    }
    const discountAmount = (grossAmount * discountValue) / 100;
    const finalAmount = grossAmount - discountAmount;

    const now = new Date();
    const billData = {
      customerName,
      customerPhone: customerPhone || "",
      ownerId: ownerId || "",
      items: billItems,
      totalAmount: finalAmount,
      billDate: now,
      day: getDayName(now),
      notes: notes || "",
      grossAmount,
      discountPercent: discountValue,
      discountAmount,
    };

    const bill = await PharmacyBill.create(billData);

    if (bulkOps.length > 0) {
      await Medicine.bulkWrite(bulkOps);
    }

    return res.status(201).json({ success: true, data: bill });
  } catch (error) {
    console.error("[pharmacyBill.createBill] error", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

exports.listBills = async (req, res) => {
  try {
    const { ownerId } = req.query;
    const filter = {};
    if (ownerId) {
      filter.ownerId = ownerId;
    }

    const bills = await PharmacyBill.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: bills });
  } catch (error) {
    console.error("[pharmacyBill.listBills] error", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

exports.getBillById = async (req, res) => {
  try {
    const bill = await PharmacyBill.findById(req.params.id);
    if (!bill) {
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });
    }
    return res.json({ success: true, data: bill });
  } catch (error) {
    console.error("[pharmacyBill.getBillById] error", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

exports.searchMedicines = async (req, res) => {
  try {
    const query = (req.query.q || req.query.name || "").trim();
    const { ownerId } = req.query;

    if (!query) {
      return res.json({ success: true, data: [] });
    }

    const filter = {
      name: { $regex: query, $options: "i" },
    };

    if (ownerId) {
      filter.ownerId = ownerId;
    }

    const meds = await Medicine.find(filter)
      .limit(10)
      .select("name price quantity ownerId");

    return res.json({ success: true, data: meds });
  } catch (error) {
    console.error("[pharmacyBill.searchMedicines] error", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

