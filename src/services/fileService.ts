import type { ApiResponse, FileItem } from "../types";
import ApiError from "../util/ApiError";
import { getValue } from "../util/localStorage";

export class FileService {
  url: string;

  constructor() {
    this.url = `${import.meta.env.VITE_API_HOST_URL}${
      import.meta.env.VITE_API_DEFAULT_PATH
    }/file`;
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
      ...(init.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
    return fetch(input, { ...init, headers });
  }

  /* =======================
     GET FILES BY PATH
  ======================== */

  async getFilesByPath(path: string) {
    // 1. Normalize path
    const normalized = path === "/" ? "/" : `/${path.replace(/^\/|\/$/g, "")}/`;

    // 2. Encode segments but PRESERVE slashes
    const encodedPath = normalized
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    const response = await this.fetchWithAuth(
      this.url + `/list-by-path?path=${encodedPath}`,
      { headers: { "Content-Type": "application/json" } }
    );

    const data: ApiResponse<{ files: FileItem[] }> = await response.json();

    if (!response.ok && response.status === 404) {
      console.warn("File endpoint not found (404). Returning empty list.");
      return [];
    }

    if (!response.ok) {
      throw new ApiError(data.message || "Failed to fetch files");
    }

    return data.data.files;
  }

  async uploadFile(file: File, path: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    const response = await this.fetchWithAuth(this.url + "/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok)
      throw new ApiError(data.message || "Failed to upload file");
    return data;
  }

  async renameFile(id: number, newName: string) {
    const response = await this.fetchWithAuth(this.url + "/rename", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, newName }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new ApiError(data.message || "Failed to rename file");
    return data;
  }

  async deleteFile(id: number) {
    const response = await this.fetchWithAuth(this.url + "/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new ApiError(data.message || "Failed to delete file");
    return data;
  }

  async downloadFile(id: number, fileName: string) {
    const response = await this.fetchWithAuth(this.url + `/download?id=${id}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || "Download failed");
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

const FileServiceInstance = new FileService();
export default FileServiceInstance;
