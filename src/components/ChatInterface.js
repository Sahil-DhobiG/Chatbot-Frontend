import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/chatbot/';

const fetchCurrentOrders = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}?type=current-orders`);
    return response.data;
  } catch (error) {
    console.error('Error fetching current orders:', error);
    return [];
  }
};

const fetchSlotAvailability = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}?type=slot-availability`);
    return response.data;
  } catch (error) {
    console.error('Error fetching slot availability:', error);
    return {
      today: [],
      tomorrow: [],
      this_week: []
    };
  }
};

const fetchPreviousOrders = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}?type=previous-orders`);
    return response.data;
  } catch (error) {
    console.error('Error fetching previous orders:', error);
    return [];
  }
};

const fetchSubscriptionStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}?type=subscription-status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return {
      active: {
        plan: "None",
        expires: "",
        price: 0,
        auto_renew: false,
        includes: []
      },
      available_plans: []
    };
  }
};

export {
  fetchCurrentOrders,
  fetchSlotAvailability,
  fetchPreviousOrders,
  fetchSubscriptionStatus
};