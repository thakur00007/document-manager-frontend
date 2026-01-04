import { ChevronRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useFolderContext } from "./context/FolderProvider";

export default function DriveNavbar() {
  const { currentPath, goBack, navigateTo } = useFolderContext();

  const segments = currentPath.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b dark:text-gray-50">
      <button onClick={goBack}>
        <ArrowLeftIcon className="w-5 h-5" />
      </button>

      <button className="hover:cursor-pointer" onClick={() => navigateTo("/")}>
        My Drive
      </button>

      {segments.map((seg, idx) => {
        const path = "/" + segments.slice(0, idx + 1).join("/");
        return (
          <div key={idx} className="flex items-center gap-2">
            <ChevronRightIcon className="w-4 h-4" />
            <button
              className="hover:cursor-pointer"
              onClick={() => navigateTo(path)}
            >
              {seg}
            </button>
          </div>
        );
      })}
    </div>
  );
}
