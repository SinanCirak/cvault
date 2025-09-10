import { Home, FolderPlus } from "lucide-react";
import { createFolder } from "../services/api";
import { useState } from "react";

/**
 * Toolbar Component
 * - Provides breadcrumb navigation for navigating folder hierarchy.
 * - Allows user to create a new folder in the current path.
 *
 * Props:
 * - prefix {string} → Current folder path (used for breadcrumbs & folder creation).
 * - onPrefixChange {function} → Callback to change current folder path.
 * - onRefresh {function} → Callback to refresh file/folder list after creation.
 */
function Toolbar({ prefix, onPrefixChange, onRefresh }) {
  const [creating, setCreating] = useState(false); // Tracks folder creation state

  // Split current path into breadcrumb parts
  const parts = prefix.split("/").filter(Boolean);

  /**
   * Navigate to a breadcrumb index.
   * Example:
   *  - prefix = "projects/aws/"
   *  - navigateTo(0) → "projects/"
   *  - navigateTo(1) → "projects/aws/"
   */
  const navigateTo = (index) => {
    const newPath = parts.slice(0, index + 1).join("/") + "/";
    onPrefixChange(newPath);
  };

  /**
   * Handle creation of a new folder.
   * 1. Ask user for folder name.
   * 2. Ensure base prefix ends with "/" for valid S3 key.
   * 3. Call backend API to create folder.
   * 4. Refresh parent component to show new folder.
   */
  const handleNewFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    const basePrefix =
      prefix.endsWith("/") || prefix === "" ? prefix : `${prefix}/`;

    setCreating(true);
    try {
      await createFolder(folderName, basePrefix);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error creating folder:", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex justify-between items-center bg-white rounded-xl shadow p-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {/* Home / Root link */}
        <Home
          size={18}
          className="cursor-pointer hover:text-blue-600"
          onClick={() => onPrefixChange("")}
        />

        {/* Subfolders (breadcrumbs) */}
        {parts.map((part, i) => (
          <span key={i} className="flex items-center">
            <span className="mx-2">/</span>
            <span
              className="cursor-pointer hover:text-blue-600"
              onClick={() => navigateTo(i)}
            >
              {part}
            </span>
          </span>
        ))}
      </div>

      {/* New Folder button */}
      <button
        onClick={handleNewFolder}
        disabled={creating}
        className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600 disabled:opacity-50"
      >
        <FolderPlus size={16} /> {creating ? "Creating..." : "New Folder"}
      </button>
    </div>
  );
}

export default Toolbar;
