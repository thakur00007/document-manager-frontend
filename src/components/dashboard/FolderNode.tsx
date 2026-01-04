import { useEffect, useState } from "react";
import {
  FolderIcon,
  DocumentIcon,
  PhotoIcon,
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useFolderContext } from "./context/FolderProvider";
import FolderServiceInstance from "../../services/folderService";
import FileServiceInstance from "../../services/fileService";
import type { Folder, FileItem } from "../../types";
import { toast } from "react-toastify";

export default function FolderNode() {
  const {
    currentPath,
    navigateTo,
    refreshKey,
    triggerRefresh,
    setCurrentFolderId,
  } = useFolderContext();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);

  // State for Rename Modal
  const [renamingItem, setRenamingItem] = useState<{
    type: "folder" | "file";
    id: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch both folders and files (uncommented files fetch)
        const [folderData, fileList] = await Promise.all([
          FolderServiceInstance.getFolderByPath(currentPath),
          FileServiceInstance.getFilesByPath(currentPath),
        ]);

        setFolders(folderData.children);
        setCurrentFolderId(folderData.currentFolder?.id || null);
        setFiles(fileList);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load content");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentPath, refreshKey, setCurrentFolderId]);

  const handleFolderClick = (name: string) => {
    const nextPath =
      currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
    navigateTo(nextPath);
  };

  const handleDelete = async (type: "folder" | "file", id: number) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      if (type === "folder") await FolderServiceInstance.deleteFolder(id);
      else await FileServiceInstance.deleteFile(id);
      toast.success("Deleted successfully");
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRenameSubmit = async (newName: string) => {
    if (!renamingItem) return;

    try {
      if (renamingItem.type === "folder") {
        await FolderServiceInstance.renameFolder(renamingItem.id, newName);
      } else {
        await FileServiceInstance.renameFile(renamingItem.id, newName);
      }
      toast.success("Renamed successfully");
      triggerRefresh();
      setRenamingItem(null);
    } catch (err: any) {
      toast.error(err.message || "Rename failed");
    }
  };

  // Helper for dynamic icons
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "png", "jpeg", "gif"].includes(ext || ""))
      return <PhotoIcon className="w-10 h-10 text-purple-500" />;
    return <DocumentIcon className="w-10 h-10 text-gray-400" />;
  };

  const handleDownload = async (file: FileItem) => {
    try {
      toast.info("Preparing download...");
      await FileServiceInstance.downloadFile(file.id, file.name);
    } catch (error: any) {
      toast.error(error.message || "Download failed");
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading...</div>;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-20">
        {/* Folders */}
        {folders.map((folder) => (
          <div key={`folder-${folder.id}`} className="relative group">
            <div
              onDoubleClick={() => handleFolderClick(folder.name)}
              className="flex flex-col items-center p-4 rounded-xl bg-amber-900/10 border border-transparent hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <FolderIcon className="w-12 h-12 text-yellow-500 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center select-none">
                {folder.name}
              </span>
            </div>
            <ContextMenu
              onDelete={() => handleDelete("folder", folder.id)}
              onRename={() =>
                setRenamingItem({
                  type: "folder",
                  id: folder.id,
                  name: folder.name,
                })
              }
            />
          </div>
        ))}

        {/* Files */}
        {files.map((file) => (
          <div key={`file-${file.id}`} className="relative group">
            <div className="flex flex-col items-center p-4 rounded-xl bg-amber-900/10 border border-transparent hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-gray-800 transition cursor-pointer">
              <div className="mb-2">{getFileIcon(file.name)}</div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center select-none">
                {file.name}
              </span>
            </div>

            <ContextMenu
              type="file"
              onDelete={() => handleDelete("file", file.id)}
              onRename={() =>
                setRenamingItem({ type: "file", id: file.id, name: file.name })
              }
              onDownload={() => handleDownload(file)}
            />
          </div>
        ))}

        {!loading && folders.length === 0 && files.length === 0 && (
          <div className="col-span-full text-center text-gray-400 mt-10">
            This folder is empty
          </div>
        )}
      </div>

      {/* Rename Modal */}
      {renamingItem && (
        <RenameModal
          isOpen={!!renamingItem}
          onClose={() => setRenamingItem(null)}
          onRename={handleRenameSubmit}
          currentName={renamingItem.name}
          type={renamingItem.type}
        />
      )}
    </>
  );
}

// --- Sub Components ---

function ContextMenu({
  type,
  onDelete,
  onRename,
  onDownload,
}: {
  type?: string;
  onDelete: () => void;
  onRename: () => void;
  onDownload?: () => void;
}) {
  return (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
        </MenuButton>
        <MenuItems className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-100 dark:border-gray-700">
          <div className="px-1 py-1">
            {/* Download Option (Only for Files) */}
            {type === "file" && onDownload && (
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={onDownload}
                    className={`${
                      active
                        ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                        : "text-gray-900 dark:text-gray-200"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                  >
                    <ArrowDownTrayIcon className="mr-2 h-4 w-4" /> Download
                  </button>
                )}
              </MenuItem>
            )}

            <MenuItem>
              {({ active }) => (
                <button
                  onClick={onRename}
                  className={`${
                    active
                      ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-gray-200"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                >
                  <PencilIcon className="mr-2 h-4 w-4" /> Rename
                </button>
              )}
            </MenuItem>

            <MenuItem>
              {({ active }) => (
                <button
                  onClick={onDelete}
                  className={`${
                    active
                      ? "bg-red-50 dark:bg-gray-700 text-red-600 dark:text-red-400"
                      : "text-gray-900 dark:text-gray-200"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                >
                  <TrashIcon className="mr-2 h-4 w-4" /> Delete
                </button>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
}

function RenameModal({
  isOpen,
  onClose,
  onRename,
  currentName,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  currentName: string;
  type: "folder" | "file";
}) {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700 scale-100 transform transition-all">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Rename {type === "folder" ? "Folder" : "File"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Enter a new name for the item.
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
          placeholder="Enter new name"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) onRename(name);
            if (e.key === "Escape") onClose();
          }}
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onRename(name)}
            disabled={!name.trim() || name === currentName}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
