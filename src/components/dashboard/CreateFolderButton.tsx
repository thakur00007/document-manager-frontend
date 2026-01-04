import { useState, useRef, useEffect } from "react";
import { PlusIcon, FolderIcon } from "@heroicons/react/24/outline";
import { useFolderContext } from "./context/FolderProvider";
import FolderServiceInstance from "../../services/folderService";
import { toast } from "react-toastify";

export default function CreateFolderButton() {
  const { triggerRefresh, currentFolderId } = useFolderContext();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setName("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const onCreate = async () => {
    if (!name.trim()) return;
    try {
      await FolderServiceInstance.createFolder(name.trim(), currentFolderId);
      toast.success("Folder created");
      triggerRefresh();
      setName("");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition"
      >
        <PlusIcon className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-medium">New Folder</span>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 rounded-lg shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 z-50">
          <div className="flex items-center gap-2 mb-2">
            <FolderIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Create Folder
            </span>
          </div>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onCreate()}
            placeholder="Folder name"
            className="w-full px-2 py-1.5 mb-3 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-sm rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              disabled={!name.trim()}
              className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
