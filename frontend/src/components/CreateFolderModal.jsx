import { useState } from "react";

/**
 * Modal component for creating a new folder in the file system.
 *
 * Props:
 * - isOpen {boolean} → Controls modal visibility
 * - onClose {function} → Callback triggered when modal is closed
 * - onConfirm {function} → Callback triggered with the new folder path
 * - currentPath {string} → Current folder path where the new folder will be created
 */
function CreateFolderModal({ isOpen, onClose, onConfirm, currentPath }) {
  const [folderName, setFolderName] = useState("");

  // Prevent rendering if modal is not open
  if (!isOpen) return null;

  /**
   * Confirm folder creation:
   * 1. Validate folder name (non-empty).
   * 2. Ensure base path ends with "/" for consistency.
   * 3. Construct full folder path (base + new folder).
   * 4. Call parent callback with new path.
   * 5. Reset state and close modal.
   */
  const handleConfirm = () => {
    if (folderName.trim() === "") return;

    const basePrefix = currentPath.endsWith("/")
      ? currentPath
      : `${currentPath}/`;

    const fullPath = `${basePrefix}${folderName}/`;
    onConfirm(fullPath);

    setFolderName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        {/* Modal Title */}
        <h2 className="text-lg font-semibold mb-3">Create New Folder</h2>

        {/* Display the current path */}
        <p className="text-sm text-gray-600 mb-2">
          Current path: <span className="font-mono">{currentPath}</span>
        </p>

        {/* Input field for folder name */}
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Enter folder name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Modal action buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateFolderModal;
