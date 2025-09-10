/**
 * UploadModal Component
 * - Displays upload progress, success, or error states in a modal dialog.
 *
 * Props:
 * - isOpen {boolean} → Controls whether modal is visible.
 * - onClose {function} → Callback executed when modal is closed.
 * - progress {number} → Upload progress percentage (0–100).
 * - status {string} → Upload status: "uploading" | "success" | "error".
 */
function UploadModal({ isOpen, onClose, progress, status }) {
  // Do not render modal if it's closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
        {/* Modal Title */}
        <h2 className="text-lg font-semibold mb-4">Uploading File</h2>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Messages */}
        {status === "uploading" && (
          <p className="text-gray-600">Uploading...</p>
        )}
        {status === "success" && (
          <p className="text-green-600">✅ Upload successful!</p>
        )}
        {status === "error" && (
          <p className="text-red-600">❌ Upload failed!</p>
        )}

        {/* Close Button */}
        <div className="mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;
