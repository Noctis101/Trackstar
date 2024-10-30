import axiosClient from "./axiosClient";

const authApi = {
  signUp: params => axiosClient.post('auth/sign-up', params),
  login: params => axiosClient.post('auth/login', params),
  verifyToken: () => axiosClient.post('auth/verify-token')
};

export default authApi;