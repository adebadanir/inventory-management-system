import axios from "axios";
import { refreshAccessToken } from "@/services/auth/auth.service";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      try {
        const newToken = await refreshAccessToken();
        error.config.headers["Authorization"] = `Bearer ${newToken}`;
        return api(error.config);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
