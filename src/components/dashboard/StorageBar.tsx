import { type JSX } from "react";

function StorageBar({
  storageUsed,
  maxStorage,
}: {
  storageUsed: number;
  maxStorage: number;
}): JSX.Element {
  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-500"
          style={{ width: `${(storageUsed / maxStorage) * 100}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {((storageUsed / maxStorage) * 100).toFixed(2)}% used (
        {(storageUsed / (1024 * 1024)).toFixed(2)} MB of{" "}
        {(maxStorage / (1024 * 1024)).toFixed(2)} MB)
      </p>
    </div>
  );
}

export default StorageBar;
