import type { ApiResponse, Folder } from "../types";
import ApiError from "../util/ApiError";
import { getValue } from "../util/localStorage";

export class FolderService {
  url: string;

  constructor() {
    this.url = `${import.meta.env.VITE_API_HOST_URL}${
      import.meta.env.VITE_API_DEFAULT_PATH
    }/folder`;
  }

  private getAccessToken(): string | null {
    return getValue("access-token");
  }

  private async fetchWithAuth(
    input: RequestInfo,
    init: RequestInit = {}
  ): Promise<Response> {
    const accessToken = this.getAccessToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
    return fetch(input, { ...init, headers });
  }

  // Read
  async getFolderByPath(path: string) {
    const normalized = path === "/" ? "/" : `/${path.replace(/^\/|\/$/g, "")}/`;
    const response = await this.fetchWithAuth(
      this.url + `/list-by-path?path=${normalized}`
    );
    const responseData: ApiResponse<{
      currentFolder: Folder | null;
      children: Folder[];
    }> = await response.json();

    if (!response.ok && responseData?.name === "ApiError") {
      throw new ApiError(responseData.message);
    }
    return responseData.data;
  }

  // Create
  async createFolder(name: string, parentId: number | null = null) {
    const response = await this.fetchWithAuth(this.url + "/create", {
      method: "POST",
      body: JSON.stringify({ data: { name, parentId } }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new ApiError(data.message || "Failed to create folder");
    return data;
  }

  // Rename
  async renameFolder(folderId: number, newName: string) {
    const response = await this.fetchWithAuth(this.url + "/rename", {
      method: "PATCH",
      body: JSON.stringify({ data: { folderId, newName } }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new ApiError(data.message || "Failed to rename folder");
    return data;
  }

  // Delete
  async deleteFolder(folderId: number) {
    const response = await this.fetchWithAuth(this.url + "/delete", {
      method: "DELETE",
      body: JSON.stringify({ data: { folderId } }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new ApiError(data.message || "Failed to delete folder");
    return data;
  }
}

const FolderServiceInstance = new FolderService();
export default FolderServiceInstance;
