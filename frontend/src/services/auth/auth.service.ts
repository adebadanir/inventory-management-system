import api from "@/utils/api";
import axios from "axios";

export async function signUp(
  name: string,
  email: string,
  password: string,
  confPassword: string
) {
  try {
    const res = await api.post("api/auth/signup", {
      name,
      email,
      password,
      confPassword,
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.message;
    } else {
      throw "Something went wrong";
    }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const res = await api.post("api/auth/signin", {
      email,
      password,
    });
    localStorage.setItem("accessToken", res.data.accessToken);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.message;
    } else {
      throw "Something went wrong";
    }
  }
}

export async function refreshAccessToken() {
  try {
    const response = await api.get("api/auth/refresh");
    localStorage.setItem("accessToken", response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.message;
    } else {
      throw "Failed to refresh token";
    }
  }
}

export async function logout() {
  try {
    await api.post("api/auth/logout");
    localStorage.removeItem("accessToken");
  } catch (error) {
    console.error("Logout failed", error);
  }
}
