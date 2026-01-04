import FolderNode from "./FolderNode";
import DriveNavbar from "./DriveNavbar";
import CreateFolderButton from "./CreateFolderButton";
import FileUploadButton from "./FileUploadButton"; // New component

function DashboardComponent() {
  return (
    <div className="flex flex-col h-full">
      <DriveNavbar />

      <div className="flex flex-wrap items-center gap-3 px-4 py-4 bg-white dark:bg-gray-900 ">
        <CreateFolderButton />
        <FileUploadButton />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <FolderNode />
      </div>
    </div>
  );
}

export default DashboardComponent;
