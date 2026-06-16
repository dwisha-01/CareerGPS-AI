import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/analysis`;

export const generateAnalysis = async (targetRole) => {
  const token = localStorage.getItem("token");

  console.log("TOKEN:", token);

  const response = await axios.post(
    `${API_URL}/generate`,
    { targetRole },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getAnalysisHistory = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/history`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const analyzeResumeFile = async (file, targetRole, targetCompany) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("targetRole", targetRole);
  formData.append("targetCompany", targetCompany);

  const response = await axios.post(
    `${API_URL}/resume`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const updateAnalysisProgress = async (analysisId, completedActivities) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${API_URL}/${analysisId}/progress`,
    { completedActivities },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const rewriteResumeBullet = async (bulletPoint, targetRole, targetCompany) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/rewrite-bullet`,
    { bulletPoint, targetRole, targetCompany },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};