const API_BASE = "https://0eo3o5vrv1.execute-api.ca-central-1.amazonaws.com/dev";

/**
 * ======================================
 * Helper: Get Authorization headers
 * ======================================
 * - Retrieves JWT token from localStorage.
 * - Merges with optional extra headers.
 */
function getAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("token");
  return {
    ...extraHeaders,
    Authorization: token ? token : "",
  };
}

/**
 * ======================================
 * S3: List objects
 * ======================================
 * @param {string} prefix - Folder path to filter results.
 * @returns {Promise<Array>} - List of files/folders.
 */
export async function listObjects(prefix = "") {
  const res = await fetch(
    `${API_BASE}/files?prefix=${encodeURIComponent(prefix)}`,
    { headers: getAuthHeaders() }
  );

  if (!res.ok) throw new Error("Failed to fetch objects");

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data.map((f) => ({
    Key: f.Key,
    Size: f.Size,
    LastModified: f.LastModified,
    status: "Active",
  }));
}

/**
 * ======================================
 * S3: Get presigned upload URL
 * ======================================
 * @param {string} key - Object key in S3.
 * @param {string} contentType - MIME type of file.
 * @returns {Promise<Object>} - Presigned URL response.
 */
export async function getUploadUrl(key, contentType) {
  const res = await fetch(`${API_BASE}/files`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ action: "getUploadUrl", key, contentType }),
  });

  if (!res.ok) throw new Error("Failed to get upload URL");
  return await res.json();
}

/**
 * ======================================
 * S3: Upload a file (Base64 body upload)
 * ======================================
 * - Used when direct presigned URL upload is not desired.
 * - Converts file into Base64 and uploads via Lambda.
 */
export async function uploadObject(file) {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result.split(",")[1];

        const res = await fetch(`${API_BASE}/files`, {
          method: "POST",
          headers: getAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            key: file.name,
            content: base64Data,
          }),
        });

        if (!res.ok) throw new Error("Upload failed");
        resolve(await res.json());
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * ======================================
 * S3: Get presigned download URL
 * ======================================
 * @param {string} key - Object key to download.
 * @returns {Promise<Object>} - Presigned URL response.
 */
export async function getDownloadUrl(key) {
  const res = await fetch(`${API_BASE}/files`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ action: "download", key }),
  });

  if (!res.ok) throw new Error("Failed to get download URL");
  return await res.json();
}

/**
 * ======================================
 * S3: Delete single object
 * ======================================
 * @param {string} key - Object key to delete.
 */
export async function deleteObject(key) {
  const res = await fetch(`${API_BASE}/files`, {
    method: "DELETE",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ key }),
  });

  if (!res.ok) throw new Error("Failed to delete file");
  return await res.json();
}

/**
 * ======================================
 * S3: Delete folder (recursive)
 * ======================================
 * @param {string} prefix - Folder path to delete.
 */
export async function deleteFolder(prefix) {
  const res = await fetch(`${API_BASE}/files`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ action: "deleteFolder", prefix }),
  });

  if (!res.ok) throw new Error("Failed to delete folder");
  return await res.json();
}

/**
 * ======================================
 * S3: Create new folder
 * ======================================
 * @param {string} folderName - Name of new folder.
 * @param {string} basePrefix - Parent folder path.
 */
export async function createFolder(folderName, basePrefix = "") {
  const res = await fetch(`${API_BASE}/files`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ action: "createFolder", folderName, basePrefix }),
  });

  if (!res.ok) throw new Error("Failed to create folder");
  return await res.json();
}
