import axios from 'axios';

axios.defaults.withCredentials = true;

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const getUserInfo = async () => {
  const response = await axios.get(`${API_BASE_URL}/user-info`);
  return response.data;
};

export const getMemories = async () => {
  const response = await axios.get(`${API_BASE_URL}/memories`);
  return response.data;
};

export const uploadMemory = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const deleteMemory = async (id) => {
  await axios.delete(`${API_BASE_URL}/memories/${id}`);
};

export const logoutUser = async () => {
  const response = await axios.post(`${API_BASE_URL}/logout`);
  return response.data;
};