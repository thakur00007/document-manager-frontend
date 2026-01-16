import { useRef } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { useFolderContext } from "./context/FolderProvider";
import FileServiceInstance from "../../services/fileService";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { updateStorageInfo } from "../../store/auth/authSlice";

export default function FileUploadButton() {
  const { currentPath, triggerRefresh } = useFolderContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const toastId = toast.loading("Uploading...");
        const response = await FileServiceInstance.uploadFile(
          file,
          currentPath
        );
        console.log("Upload response:", response);
        const { storageUsed, maxStorage } = response.data.file;

        dispatch(updateStorageInfo({ storageUsed, maxStorage }));

        toast.update(toastId, {
          render: "File uploaded successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        triggerRefresh();
      } catch (error: any) {
        toast.dismiss();
        toast.error(error.message || "Upload failed");
      }
      e.target.value = "";
    }
  };

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 transition"
      >
        <ArrowUpTrayIcon className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-medium">
          Upload File
        </span>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}
