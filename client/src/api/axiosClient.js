import axios from 'axios';
import queryString from 'query-string';

const baseUrl = 'http://127.0.0.1:5000/api/v1/';

const getToken = () => localStorage.getItem('token');

const axiosClient = axios.create({
  baseURL: baseUrl,
  paramsSerializer: params => queryString.stringify(params)
});

axiosClient.interceptors.request.use(
  async config => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  response => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  error => {
    if (error.response) {
      return Promise.reject(error.response.data);
    } else if (error.request) {
      console.error('Request without response:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
