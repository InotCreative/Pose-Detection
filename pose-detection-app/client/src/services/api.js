import axios from 'axios';

const API_URL = '/api';

export const saveDetection = async (poseData) => {
  try {
    const response = await axios.post(`${API_URL}/poses`, poseData);
    return response.data;
  } catch (error) {
    console.error('Error saving pose data:', error);
    throw error;
  }
};

export const getPoseHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/poses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pose history:', error);
    throw error;
  }
};
