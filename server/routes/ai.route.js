const { Router } = require("express");
const { getResultController } = require("../controllers/ai.controller");

const router = Router();

router.get("/generate-questions", getResultController);

module.exports = router;
