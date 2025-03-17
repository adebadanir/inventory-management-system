import axios from "axios";
import { generateRefreshToken } from "../services/auth.service";

const customAxios = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});
customAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    console.log(originalRequest);

    if (error.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await generateRefreshToken();
        return customAxios(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }
    }
    return Promise.reject(error);
  }
);
export default customAxios;
