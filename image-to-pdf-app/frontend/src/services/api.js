import axios from "axios";

/**
 * Base Axios instance.
 *
 * In DEVELOPMENT: Vite proxies /api → http://localhost:8000
 * In PRODUCTION:  VITE_API_URL env var points to the deployed backend.
 *
 * Set VITE_API_URL in your .env or Vercel/Render dashboard:
 *   VITE_API_URL=https://img2pdf-backend.onrender.com/api
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 120_000, // 2 min for large uploads
});

/**
 * POST /api/convert
 * @param {File[]} files - Array of image File objects
 * @param {function} onProgress - Progress callback (0–100)
 * @returns {Promise<Blob>} PDF blob
 */
export async function convertImagesToPdf(files, onProgress) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await api.post("/convert", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    responseType: "blob",
    onUploadProgress: (e) => {
      if (e.total) {
        const pct = Math.round((e.loaded * 100) / e.total);
        onProgress?.(pct);
      }
    },
  });

  return response.data;
}

export default api;
