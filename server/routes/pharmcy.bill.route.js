const { Router } = require("express");
const {
  createBill,
  listBills,
  getBillById,
  searchMedicines,
} = require("../controllers/pharmcy.bill.controller");

const router = Router();

router.get("/medicine/suggestions", searchMedicines);
router.post("/", createBill);
router.get("/", listBills);
router.get("/:id", getBillById);

module.exports = router;

