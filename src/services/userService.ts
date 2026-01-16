import axios from "axios";
import api from "./api"; // Import the global instance
import type { ApiResponse, User, UserLogin, UserSignup } from "../types/";
import ApiError from "../util/ApiError";
import { setValue, removeValue, getValue } from "../util/localStorage";

export class UserService {
  // Helper to standardize error handling across all methods
  private handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || "An unexpected error occurred!";
      throw new ApiError(message);
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError("An unexpected error occurred! Please try again.");
  }

  /* =======================
     AUTH APIs
  ======================== */

  async userSignup(userDetails: UserSignup) {
    try {
      // Use 'api' instance. Path is relative to /api/v1, so we add /user/create
      const response = await api.post<ApiResponse<{ user: User }>>(
        "/user/create",
        { user: userDetails }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async userLogin(credentials: UserLogin) {
    try {
      const response = await api.post<
        ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
      >("/user/login", { user: credentials });

      const { accessToken, refreshToken } = response.data.data;

      // Store tokens using helper
      setValue("access-token", accessToken);
      setValue("refresh-token", refreshToken);

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCurrentUser() {
    try {
      // Authorization header is auto-injected by api interceptor
      const response =
        await api.get<ApiResponse<{ user: User }>>("/user/profile");
      return response.data;
    } catch (error) {
      console.log(error);
      this.handleError(error);
    }
  }

  async logout() {
    try {
      const response = await api.post<ApiResponse<unknown>>("/user/logout");
      this.clearTokens();
      return response.data;
    } catch (error) {
      // Even if API fails, clear local tokens
      this.clearTokens();
      this.handleError(error);
    }
  }

  // Manual refresh method (optional, mostly handled by interceptor now)
  async refreshToken() {
    const refreshToken = getValue("refresh-token");
    if (!refreshToken) {
      this.clearTokens();
      throw new ApiError("Session expired. Please login again.");
    }

    try {
      // Using 'api' here is fine; if 401, the interceptor will catch it anyway
      const response = await api.post<
        ApiResponse<{ accessToken: string; refreshToken: string }>
      >("/user/refresh-token", { refreshToken });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      setValue("access-token", accessToken);
      setValue("refresh-token", newRefreshToken);

      return response.data;
    } catch (error) {
      this.clearTokens();
      this.handleError(error);
    }
  }

  private clearTokens() {
    removeValue("access-token");
    removeValue("refresh-token");
  }
}

const UserServiceInstance = new UserService();
export default UserServiceInstance;
