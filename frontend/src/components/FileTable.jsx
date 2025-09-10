import { useState, useEffect } from "react";
import { ArrowUpDown, Download, Trash2 } from "lucide-react";
import DeleteModal from "./DeleteModal";
import {
  listObjects,
  deleteObject,
  getDownloadUrl,
  deleteFolder,
} from "../services/api";

/**
 * ======================================
 * Utility: Convert bytes → human-readable string
 * ======================================
 */
const formatSize = (bytes) => {
  if (bytes === undefined || bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * ======================================
 * Utility: Convert ISO date → user-friendly string
 * ======================================
 */
const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * FileTable Component
 * - Displays list of files and folders from S3.
 * - Supports folder navigation, download, and delete operations.
 * - Responsive UI (desktop table & mobile card view).
 *
 * Props:
 * - prefix {string} → Current folder path.
 * - uploadedFile {object} → Newly uploaded file to be added to state.
 * - onPrefixChange {function} → Callback to navigate into a folder.
 * - refreshTrigger {any} → Dependency to trigger reload (e.g. Date.now()).
 * - onRefresh {function} → Callback to notify parent to refresh state.
 */
function FileTable({
  prefix = "",
  uploadedFile,
  onPrefixChange,
  refreshTrigger,
  onRefresh,
}) {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  /**
   * Fetch objects when prefix or refreshTrigger changes.
   * Separates folders and files:
   * - Folders: detected via trailing "/" keys.
   * - Files: only immediate children (exclude nested deeper paths).
   */
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await listObjects(prefix);
        const items = Array.isArray(res) ? res : [];

        const folderSet = new Set();
        const fileList = [];

        items.forEach((f) => {
          const relativeKey = f.Key.replace(prefix, "");

          if (relativeKey.endsWith("/")) {
            // Folder marker: extract first segment
            const folderName = relativeKey.split("/")[0] + "/";
            if (folderName && folderName !== "/") {
              folderSet.add(prefix + folderName);
            }
          } else {
            // File object (skip empty markers & nested paths)
            if (f.Key !== prefix && relativeKey !== "") {
              if (!relativeKey.includes("/")) {
                fileList.push({ ...f, status: "Active" });
              }
            }
          }
        });

        setFolders([...folderSet].map((key) => ({ Key: key })));
        setFiles(fileList);
      } catch (err) {
        console.error("Fetch error:", err);
        setFiles([]);
        setFolders([]);
      }
    };

    fetchFiles();
  }, [prefix, refreshTrigger]);

  /**
   * Add uploaded file into state immediately
   * (optimistic UI update without waiting for refresh).
   */
  useEffect(() => {
    if (uploadedFile && uploadedFile.Key.startsWith(prefix)) {
      setFiles((prev) => {
        const filtered = prev.filter((f) => f.Key !== uploadedFile.Key);
        return [...filtered, { ...uploadedFile, status: "Active" }];
      });
    }
  }, [uploadedFile, prefix]);

  /**
   * Handle file download using presigned URL.
   * Generates a temporary link, triggers browser download, then cleans up.
   */
  const handleDownload = async (key) => {
    try {
      const { url } = await getDownloadUrl(key);
      const link = document.createElement("a");
      link.href = url;
      link.download = key.split("/").pop();
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  /**
   * Confirm delete action.
   * - If folder → recursive deletion handled by backend.
   * - If file → delete single object.
   * After deletion, parent is notified for refresh.
   */
  const confirmDelete = async () => {
    try {
      if (fileToDelete.endsWith("/")) {
        await deleteFolder(fileToDelete);
      } else {
        await deleteObject(fileToDelete);
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setModalOpen(false);
      setFileToDelete(null);
    }
  };

  return (
    <div>
      {/* Header with sort placeholder */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Files & Folders</h2>
        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-black">
          Sort <ArrowUpDown size={16} />
        </button>
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Size</th>
              <th className="p-3 text-center">Last Modified</th>
              <th className="p-3 text-center">Download</th>
              <th className="p-3 text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {/* Folders */}
            {folders.map((folder, i) => (
              <tr key={`folder-${i}`} className="border-b hover:bg-gray-50">
                <td className="p-3 align-middle font-medium text-purple-600">
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => onPrefixChange(folder.Key)}
                  >
                    📁 {folder.Key.replace(prefix, "").replace("/", "")}
                  </span>
                </td>
                <td className="p-3 text-center" colSpan={3}></td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => {
                      setFileToDelete(folder.Key);
                      setModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-800"
                    title="Delete folder"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {/* Files */}
            {files.map((file, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-3 align-middle">
                  {file.Key.replace(prefix, "")}
                </td>
                <td className="p-3">{formatSize(file?.Size)}</td>
                <td className="p-3 text-center">
                  {formatDate(file?.LastModified)}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleDownload(file.Key)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Download file"
                  >
                    <Download size={20} className="mx-auto" />
                  </button>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => {
                      setFileToDelete(file.Key);
                      setModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-800"
                    title="Delete file"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="block md:hidden space-y-3">
        {/* Folders */}
        {folders.map((folder, i) => (
          <div
            key={`folder-m-${i}`}
            className="border rounded-lg p-3 shadow-sm bg-purple-50 flex justify-between items-center"
          >
            <span
              className="font-medium text-purple-700 cursor-pointer hover:underline"
              onClick={() => onPrefixChange(folder.Key)}
            >
              📁 {folder.Key.replace(prefix, "").replace("/", "")}
            </span>
            <button
              onClick={() => {
                setFileToDelete(folder.Key);
                setModalOpen(true);
              }}
              className="text-red-600 hover:text-red-800"
              title="Delete folder"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}

        {/* Files */}
        {files.map((file, i) => (
          <div key={`file-m-${i}`} className="border rounded-lg p-3 shadow-sm">
            <div className="flex justify-between">
              <span className="font-medium">
                {file.Key.replace(prefix, "")}
              </span>
              <span className="text-xs text-gray-500">
                {formatSize(file.Size)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(file.LastModified)}
            </div>
            <div className="flex justify-end gap-4 mt-2">
              <button
                onClick={() => handleDownload(file.Key)}
                className="text-blue-600 hover:text-blue-800"
                title="Download file"
              >
                <Download size={20} />
              </button>
              <button
                onClick={() => {
                  setFileToDelete(file.Key);
                  setModalOpen(true);
                }}
                className="text-red-600 hover:text-red-800"
                title="Delete file"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        fileKey={fileToDelete}
      />
    </div>
  );
}

export default FileTable;
