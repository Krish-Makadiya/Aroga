const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
require("dotenv").config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

const parseMedicalDocument = async (file) => {
  try {
    
    const fileBuffer = fs.readFileSync(file.path);
    
   
    const base64Data = fileBuffer.toString("base64");

   
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    
    const filePart = {
      inlineData: {
        data: base64Data,
        mimeType: file.mimetype, 
      },
    };

    
    const prompt = `
      You are an expert medical data assistant. Analyze the attached medical document.
      
      Extract the following details:
      1. Type of document (e.g., Blood Test, MRI, Prescription, Discharge Summary).
      2. Date of the document (Format: YYYY-MM-DD). If not found, use today's date.
      3. A concise summary of the key findings, diagnosis, or prescribed medicines (max 3 sentences).

      Return the response strictly as a JSON object in this format:
      {
        "type": "string",
        "date": "YYYY-MM-DD",
        "summary": "string"
      }
    `;

    
    const result = await model.generateContent([prompt, filePart]);
    const response = result.response;
    const text = response.text();


    let parsedData;
    try {
     
      const cleanText = text.replace(/```json|```/g, "").trim();
      parsedData = JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON Parsing Error:", e);
      
      parsedData = {
        type: "Medical Document",
        date: new Date().toISOString().split("T")[0],
        summary: text.substring(0, 200) 
      };
    }

    return parsedData;

  } catch (error) {
    console.error("Error inside parseMedicalDocument:", error);
    throw new Error("Failed to process document with AI");
  }
};

module.exports = {
    parseMedicalDocument
};