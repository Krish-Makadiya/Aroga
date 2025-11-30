import axios from "axios";

const API_URL = "http://localhost:5000/api/patient";

export const getPrescribedMedications = async (clerkUserId) => {
  const response = await axios.get(`${API_URL}/prescribed-medications?clerkUserId=${clerkUserId}`);
  return response.data;
};

export const getAppointmentHistory = async (clerkUserId) => {
  const response = await axios.get(`${API_URL}/appointment-history?clerkUserId=${clerkUserId}`);
  return response.data;
};

export const getPersonalMedicalRecords = async (token) => {
  const response = await axios.get(`${API_URL}/medical-records`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
};


export const addPersonalMedicalRecord = async (formData, token) => {
  const response = await axios.post(`${API_URL}/medical-records`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.data;
};

export const deleteMedicalRecord = async (recordId, token) => {
  const response = await axios.delete(`${API_URL}/medical-records/${recordId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
};