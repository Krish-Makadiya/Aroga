const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/upload"); 
const { parseMedicalDocument } = require("../config/ai.config");

router.post("/parse-document", upload.single('file'),
  async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        const result = await parseMedicalDocument(req.file); 
        
        res.json({ data: result });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ message: "AI parsing failed", error: error.message });
    }
});

module.exports = router;