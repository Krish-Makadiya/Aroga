const express = require("express");
const router = express.Router();

const { getOverview } = require('../controllers/admin.controller');

// Create admin (legacy/example)
router.post('/create-admin', (req, res) => {
    const { userId, password } = req.body;
    // NOTE: implement your own admin creation flow securely (this is a placeholder)
    return res.json({ success: true, message: 'create-admin placeholder' });
});

// GET /api/admin/overview - high level metrics for admin dashboard
router.get('/overview', getOverview);

module.exports = router;