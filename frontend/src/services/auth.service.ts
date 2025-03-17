import { NavigateFunction } from "react-router";
import customAxios from "../api/api";

export const login = async (
  userInputs: userInputs,
  navigate: NavigateFunction
) => {
  try {
    const response = await customAxios.post("/auth/login", {
      email: userInputs.email,
      password: userInputs.password,
    });
    if (response.status === 200) {
      navigate("/dashboard");
    }
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const signup = async (
  userInputs: userInputs,
  navigate: NavigateFunction
) => {
  try {
    const response = await customAxios.post("/auth/signup", {
      name: userInputs.name,
      email: userInputs.email,
      password: userInputs.password,
      confPassword: userInputs.confPassword,
    });

    if (response.status === 201) {
      navigate("/");
    }
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const generateRefreshToken = async () => {
  try {
    await customAxios.get(`/auth/generate-token`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error(error);
  }
};

export const logout = async () => {
  try {
    await customAxios.post("/auth/logout", {
      withCredentials: true,
    });
  } catch (error) {
    console.error(error);
  }
};

export const me = async () => {
  try {
    const response = await customAxios.get("/auth/me", {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const checkAuth = async () => {
  try {
    const response = await customAxios.get("/auth/check-token", {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error(error);
  }
};
