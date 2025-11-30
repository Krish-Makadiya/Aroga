// client/src/api/gemini.js
import axios from "axios";

const GEMINI_API_URL = "http://localhost:5000/api/gemini";

export const parseMedicalDocument = async (formData) => {
  const response = await axios.post(`${GEMINI_API_URL}/parse-document`, formData);
  return response.data;
};