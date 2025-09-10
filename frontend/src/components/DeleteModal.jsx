/**
 * Confirmation modal for deleting files or folders.
 *
 * Props:
 * - isOpen {boolean} → Controls modal visibility.
 * - onClose {function} → Callback executed when user cancels/ closes modal.
 * - onConfirm {function} → Callback executed when user confirms deletion.
 * - fileKey {string} → Name/key of the file or folder to be deleted.
 * - isFolder {boolean} → Indicates whether the target is a folder (default: false).
 * - hasFiles {boolean} → Indicates whether the folder contains files (used only when isFolder = true).
 */
function DeleteModal({ isOpen, onClose, onConfirm, fileKey, isFolder = false, hasFiles = false }) {
  // Prevent rendering if modal is not open
  if (!isOpen) return null;

  // Build confirmation message dynamically based on type (file/folder)
  let message;
  if (isFolder) {
    if (hasFiles) {
      message = (
        <>
          The folder <span className="font-medium">{fileKey}</span> contains files. <br />
          Do you want to delete <strong>all files inside</strong> as well?
        </>
      );
    } else {
      message = (
        <>
          Are you sure you want to delete the folder <span className="font-medium">{fileKey}</span>? <br />
          This action cannot be undone.
        </>
      );
    }
  } else {
    message = (
      <>
        Are you sure you want to delete <span className="font-medium">{fileKey}</span>? <br />
        This action cannot be undone.
      </>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
        {/* Modal Title */}
        <h2 className="text-lg font-semibold mb-3">
          {isFolder ? "Confirm Folder Delete" : "Confirm File Delete"}
        </h2>

        {/* Confirmation message */}
        <p className="text-sm text-gray-600 mb-6">{message}</p>

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm"
          >
            {isFolder ? "Delete Folder" : "Delete File"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
