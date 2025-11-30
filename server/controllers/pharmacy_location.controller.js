const mongoose = require("mongoose");
const PharmacyLocation = require("../schema/Pharmacy_Location.schema");

// Create pharmacy
exports.createPharmacy = async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    const pharmacy = await PharmacyLocation.create({
      name,
      address,
      location: {
        type: "Point",
        coordinates: [longitude, latitude]
      }
    });

    res.json(pharmacy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update location (from Leaflet drag)
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, name, address } = req.body;
    const pharmacyId = req.params.id;

    console.log("[pharmacyLocation.updateLocation] incoming", {
      pharmacyId,
      body: { latitude, longitude, name, address },
      dbName: mongoose.connection.name,
      dbHost: mongoose.connection.host,
      collection: PharmacyLocation.collection.name,
    });

    // First try to find existing location by ownerId
    let pharmacyLocation = await PharmacyLocation.findOne({ ownerId: pharmacyId });

    if (pharmacyLocation) {
      // Update existing location
      pharmacyLocation = await PharmacyLocation.findByIdAndUpdate(
        pharmacyLocation._id,
        {
          name: name || pharmacyLocation.name,
          address: address || pharmacyLocation.address,
          location: {
            type: "Point",
            coordinates: [longitude, latitude]
          }
        },
        { new: true }
      );
    } else {
      // Create new location
      pharmacyLocation = await PharmacyLocation.create({
        ownerId: pharmacyId,
        name: name || "Pharmacy Location",
        address: address || "",
        location: {
          type: "Point",
          coordinates: [longitude, latitude]
        }
      });
    }

    console.log("[pharmacyLocation.updateLocation] saved document", {
      _id: pharmacyLocation?._id?.toString(),
      ownerId: pharmacyLocation?.ownerId,
      coordinates: pharmacyLocation?.location?.coordinates,
      name: pharmacyLocation?.name,
      address: pharmacyLocation?.address,
    });

    res.json({ success: true, data: pharmacyLocation });
  } catch (err) {
    console.error("Error updating location:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get pharmacy location by ownerId (pharmacy id)
exports.getLocationByOwner = async (req, res) => {
  try {
    const pharmacyId = req.params.id;

    console.log("[pharmacyLocation.getLocationByOwner] lookup", {
      pharmacyId,
      dbName: mongoose.connection.name,
      dbHost: mongoose.connection.host,
      collection: PharmacyLocation.collection.name,
    });

    const pharmacyLocation = await PharmacyLocation.findOne({ ownerId: pharmacyId });

    if (!pharmacyLocation) {
      console.warn("[pharmacyLocation.getLocationByOwner] not found", { pharmacyId });
      return res.status(404).json({
        success: false,
        message: "Pharmacy location not found",
      });
    }

    console.log("[pharmacyLocation.getLocationByOwner] found", {
      _id: pharmacyLocation._id.toString(),
      ownerId: pharmacyLocation.ownerId,
      coordinates: pharmacyLocation.location?.coordinates,
      name: pharmacyLocation.name,
      address: pharmacyLocation.address,
    });

    res.json({ success: true, data: pharmacyLocation });
  } catch (err) {
    console.error("Error fetching pharmacy location:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get nearby pharmacies
exports.getNearby = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    const pharmacies = await PharmacyLocation.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    });

    res.json(pharmacies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
