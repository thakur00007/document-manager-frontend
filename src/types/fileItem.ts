export interface FileItem {
  id: number;
  name: string;
  type: string; // 'image', 'video', 'pdf', 'text', etc.
  size: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}
