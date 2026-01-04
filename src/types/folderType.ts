export interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  depth: number;
  path: string;
  createdAt: string;
  updatedAt: string;
}
