import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getValue, setValue, removeValue } from "../util/localStorage";
import type { ApiResponse } from "../types";

// Base URL: http://localhost:4000/api/v1
const BASE_URL = `${import.meta.env.VITE_API_HOST_URL}${
  import.meta.env.VITE_API_DEFAULT_PATH
}`;

// 1. Create the global instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getValue("access-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor: Handle Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 Unauthorized and we haven't retried yet
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "ACCESS_TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      console.log(error);
      originalRequest._retry = true;

      try {
        const refreshToken = getValue("refresh-token");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint using a CLEAN axios instance
        // (We don't use 'api' here to avoid infinite interceptor loops)
        const response = await axios.post(`${BASE_URL}/user/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Save new tokens
        setValue("access-token", accessToken);
        setValue("refresh-token", newRefreshToken);

        // Update the header of the original failed request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry the original request with the global 'api' instance
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (token invalid/expired) -> Log out user
        removeValue("access-token");
        removeValue("refresh-token");

        // Optional: Redirect to login page if not already there
        // window.location.href = "/signin";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
