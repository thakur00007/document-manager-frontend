// import axios from "axios";
import type { ApiResponse, User, UserLogin, UserSignup } from "../types/";
import ApiError from "../util/ApiError";
import { setValue, getValue, removeValue } from "../util/localStorage";

export class UserService {
  url: string;

  constructor() {
    this.url = `${import.meta.env.VITE_API_HOST_URL}${
      import.meta.env.VITE_API_DEFAULT_PATH
    }/user`;
  }

  /* =======================
     TOKEN HELPERS
  ======================== */

  private getAccessToken(): string | null {
    return getValue("access-token");
  }

  private getRefreshToken(): string | null {
    return getValue("refresh-token");
  }

  private setTokens(accessToken?: string, refreshToken?: string) {
    accessToken && setValue("access-token", accessToken);
    refreshToken && setValue("refresh-token", refreshToken);
  }

  private clearTokens() {
    removeValue("access-token");
    removeValue("refresh-token");
  }

  /* =======================
     FETCH WITH AUTO REFRESH
  ======================== */

  private async fetchWithAuth(
    input: RequestInfo,
    init: RequestInit = {},
    retry = true
  ): Promise<Response> {
    const accessToken = this.getAccessToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    const response = await fetch(input, { ...init, headers });
    // Access token expired → refresh once
    if (response.status === 401 && retry) {
      let body: any = null;

      try {
        body = await response.clone().json();
      } catch {
        body = null;
      }

      if (body?.message === "ACCESS_TOKEN_EXPIRED") {
        await this.refreshToken();
        return this.fetchWithAuth(input, init, false);
      }
    }

    return response;
  }

  /* =======================
     AUTH APIs
  ======================== */

  async userSignup(userDetails: UserSignup) {
    try {
      const response = await fetch(this.url + "/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userDetails }),
      });

      const responseData: ApiResponse<{ user: User }> = await response.json();

      if (!response.ok && responseData?.name === "ApiError") {
        throw new ApiError(responseData.message);
      }

      return responseData;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("An unexpected error occurred! Please try again.");
    }
  }

  async userLogin(credentials: UserLogin) {
    try {
      const response = await fetch(this.url + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: credentials }),
      });

      const responseData: ApiResponse<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }> = await response.json();

      if (!response.ok && responseData?.name === "ApiError") {
        throw new ApiError(responseData.message);
      }

      this.setTokens(
        responseData.data.accessToken,
        responseData.data.refreshToken
      );

      return responseData;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("An unexpected error occurred! Please try again.");
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.fetchWithAuth(this.url + "/profile");
      const responseData: ApiResponse<{ user: User }> = await response.json();

      if (!response.ok && responseData?.name === "ApiError") {
        throw new ApiError(responseData.message);
      }

      return responseData;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("An unexpected error occurred! Please try again.");
    }
  }

  async logout() {
    try {
      const response = await this.fetchWithAuth(this.url + "/logout", {
        method: "POST",
      });

      const responseData: ApiResponse<unknown> = await response.json();

      if (!response.ok && responseData?.name === "ApiError") {
        throw new ApiError(responseData.message);
      }

      this.clearTokens();
      return responseData;
    } catch (error) {
      this.clearTokens();
      if (error instanceof ApiError) throw error;
      throw new ApiError("An unexpected error occurred! Please try again.");
    }
  }

  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      throw new ApiError("Session expired. Please login again.");
    }

    const response = await fetch(this.url + "/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const responseData: ApiResponse<{
      accessToken: string;
      refreshToken: string;
    }> = await response.json();

    if (!response.ok) {
      this.clearTokens();
      throw new ApiError("Session expired. Please login again.");
    }

    this.setTokens(
      responseData.data.accessToken,
      responseData.data.refreshToken
    );

    return responseData;
  }
}

const UserServiceInstance = new UserService();
export default UserServiceInstance;
