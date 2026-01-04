import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type FolderContextType = {
  currentPath: string;
  refreshKey: number; // Used to trigger re-renders
  setCurrentFolderId: (id: number | null) => void;
  currentFolderId: number | null;
  navigateTo: (path: string) => void;
  goBack: () => void;
  triggerRefresh: () => void;
};

const FolderContext = createContext<FolderContextType | null>(null);

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const pathSuffix = location.pathname.replace(/^\/dashboard/, "");
  const currentPath = pathSuffix ? decodeURIComponent(pathSuffix) : "/";

  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const navigateTo = (path: string) => {
    const targetPath = path.startsWith("/") ? path : `/${path}`;
    navigate(`/dashboard${targetPath}`);
  };

  const goBack = () => {
    navigate(-1);
  };

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    setCurrentFolderId(null);
  }, [currentPath]);

  return (
    <FolderContext.Provider
      value={{
        currentPath,
        currentFolderId,
        setCurrentFolderId,
        refreshKey,
        navigateTo,
        goBack,
        triggerRefresh,
      }}
    >
      {children}
    </FolderContext.Provider>
  );
}

export function useFolderContext() {
  const ctx = useContext(FolderContext);
  if (!ctx) {
    throw new Error("useFolderContext must be used inside FolderProvider");
  }
  return ctx;
}
