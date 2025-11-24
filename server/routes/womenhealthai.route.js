const express = require('express');
const router = express.Router();
const womenHealthAiController = require('../controllers/womenhealthai.controller');

// POST /api/womenhealthai/review
router.post('/review', womenHealthAiController.review);

module.exports = router;
