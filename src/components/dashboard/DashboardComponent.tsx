import FolderNode from "./FolderNode";
import DriveNavbar from "./DriveNavbar";
import CreateFolderButton from "./CreateFolderButton";
import FileUploadButton from "./FileUploadButton"; // New component
import StorageBar from "./StorageBar";
import type { AuthState } from "../../store/auth/authSlice";
import { useSelector } from "react-redux";

function DashboardComponent() {
  const { loggedInUser }: AuthState = useSelector(
    (state: { auth: AuthState }) => state.auth
  );
  return (
    <div className="flex flex-col h-full">
      <DriveNavbar />

      <div className="flex flex-wrap items-center gap-3 px-4 py-4 bg-white dark:bg-gray-900 ">
        <CreateFolderButton />
        <FileUploadButton />
        <StorageBar
          storageUsed={loggedInUser?.storageUsed ?? 0}
          maxStorage={loggedInUser?.maxStorage ?? 1073741824}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <FolderNode />
      </div>
    </div>
  );
}

export default DashboardComponent;
