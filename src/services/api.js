import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/chatbot/';

// Updated API service methods to use the consolidated query parameter
export const fetchGreeting = async (username) => {
  return await axios.post(
    `${API_BASE_URL}?query=greet-user`,
    { name: username }
  );
};

export const fetchOptionDetails = async (optionId) => {
  return await axios.get(`${API_BASE_URL}?id=${optionId}`);
};

export const searchChatbot = async (searchTerm) => {
  return await axios.get(`${API_BASE_URL}?query=${searchTerm}`);
};

export const fetchCurrentOrders = async () => {
  return await axios.get(`${API_BASE_URL}?query=current-orders`);
};

export const fetchPreviousOrders = async () => {
  return await axios.get(`${API_BASE_URL}?query=previous-orders`);
};

export const fetchSlotAvailability = async () => {
  return await axios.get(`${API_BASE_URL}?query=slot-availability`);
};

export const fetchSubscriptionStatus = async () => {
  return await axios.get(`${API_BASE_URL}?query=subscription-status`);
};

export const fetchAllData = async () => {
  return await axios.get(`${API_BASE_URL}?query=order-data`);
};
