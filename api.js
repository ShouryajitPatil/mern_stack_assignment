import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getCombinedData = (month) => {
  return axios.get(`${API_URL}/combined-data`, {
    params: { month },
  });
};

export const getTransactions = (page, perPage, month, search) => {
  return axios.get(`${API_URL}/transactions`, {
    params: { page, perPage, month, search },
  });
};
