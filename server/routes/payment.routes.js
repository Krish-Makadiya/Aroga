const { Router } = require("express");
const {
    paymentOrderController,
    savePaymentData,
} = require("../controllers/payment.controller");

const router = Router();

router.post("/create-order", paymentOrderController);
router.post("/save-payment", savePaymentData);

module.exports = router;
