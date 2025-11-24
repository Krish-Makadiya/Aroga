const { generatePrompt } = require("../config/ai.config");

// POST /api/womenhealthai/review
exports.review = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }
        const result = await generatePrompt(prompt);
        // Extract JSON from markdown if needed
        let cleanResult = result;
        const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            cleanResult = jsonMatch[1].trim();
        }
        // Attempt to return JSON, fall back to plain text
        try {
            const parsed = JSON.parse(cleanResult);
            return res.json(parsed);
        } catch (parseError) {
            return res.json({ type: "text", content: cleanResult });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
