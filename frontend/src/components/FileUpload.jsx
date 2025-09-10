import { useDropzone } from "react-dropzone";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import UploadModal from "./UploadModal";
import { getUploadUrl } from "../services/api"; // Presigned URL generator (Lambda → S3)

/**
 * FileUpload Component
 * - Allows users to upload files into S3 via presigned URLs.
 * - Displays drag & drop area and an upload progress modal.
 *
 * Props:
 * - onFileUploaded {function} → Callback executed when a file upload completes.
 * - currentPrefix {string} → Path/prefix where file will be stored in S3.
 */
function FileUpload({ onFileUploaded, currentPrefix = "" }) {
  const [modalOpen, setModalOpen] = useState(false); // Modal visibility
  const [progress, setProgress] = useState(0); // Upload progress (0–100)
  const [status, setStatus] = useState("uploading"); // "uploading" | "success" | "error"

  /**
   * Upload file to S3 with progress tracking.
   * Steps:
   * 1. Request a presigned URL from backend (Lambda).
   * 2. Use XMLHttpRequest to PUT file to S3 with progress events.
   * 3. Update UI (progress bar + status).
   * 4. Notify parent on successful upload.
   */
  const uploadWithProgress = async (file) => {
    try {
      console.log("Uploading:", file.name); // 🔍 Debug
      setModalOpen(true);
      setStatus("uploading");
      setProgress(0);

      // 1. Get presigned URL from API (include Content-Type)
      const { url } = await getUploadUrl(currentPrefix + file.name, file.type);
      console.log("Presigned URL:", url); // 🔍 Debug

      // 2. Upload using XMLHttpRequest for progress tracking
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url, true);

        // Set content type for proper S3 object metadata
        xhr.setRequestHeader("Content-Type", file.type);

        // Progress handler → update modal progress bar
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setProgress(percent);
          }
        };

        // Success handler
        xhr.onload = () => {
          if (xhr.status === 200) {
            setStatus("success");
            resolve();
          } else {
            console.error("S3 response:", xhr.responseText);
            setStatus("error");
            reject(new Error("Upload failed"));
          }
        };

        // Network / request error handler
        xhr.onerror = () => {
          setStatus("error");
          reject(new Error("Upload error"));
        };

        xhr.send(file);
      });

      // 3. Notify parent once upload is complete
      if (onFileUploaded) {
        onFileUploaded({ Key: currentPrefix + file.name });
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setStatus("error");
    }
  };

  /**
   * Handle dropped or selected files.
   * Multiple file uploads are supported.
   */
  const onDrop = (acceptedFiles) => {
    for (const file of acceptedFiles) {
      uploadWithProgress(file);
    }
  };

  // React Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,    // Allow click to open file picker (mobile support)
    noKeyboard: false, // Enable keyboard accessibility
    multiple: true,    // Allow multiple file uploads
  });

  return (
    <>
      {/* Upload area */}
      <div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition 
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="w-10 h-10 text-blue-500 mx-auto mb-3" />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop files here 🚀</p>
        ) : (
          <p className="text-gray-600">
            Drag & drop files here, or click to select
          </p>
        )}
        {currentPrefix && (
          <p className="text-xs text-gray-500 mt-2">
            Uploading into: <span className="font-mono">{currentPrefix}</span>
          </p>
        )}
      </div>

      {/* Upload progress modal */}
      <UploadModal
        isOpen={modalOpen}
        progress={progress}
        status={status}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

export default FileUpload;
