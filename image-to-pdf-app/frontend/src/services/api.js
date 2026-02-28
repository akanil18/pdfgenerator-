import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 180_000, // 3 min for large files
});

/* ───── helpers ───── */

function makeProgress(onProgress) {
  return {
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total));
    },
  };
}

function blobPost(url, formData, onProgress) {
  return api
    .post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "blob",
      ...makeProgress(onProgress),
    })
    .then((r) => r.data);
}

/* ───── Image to PDF ───── */

export async function convertImagesToPdf(files, onProgress, pageSize = "fit") {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  fd.append("page_size", pageSize);
  return blobPost("/convert", fd, onProgress);
}

/* ───── Merge PDF ───── */

export async function mergePdfs(files, onProgress) {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  return blobPost("/merge", fd, onProgress);
}

/* ───── Split PDF ───── */

export async function splitPdf(file, ranges, onProgress) {
  const fd = new FormData();
  fd.append("file", file);
  if (ranges) fd.append("ranges", ranges);
  return blobPost("/split", fd, onProgress);
}

/* ───── PDF to Word ───── */

export async function pdfToWord(file, onProgress) {
  const fd = new FormData();
  fd.append("file", file);
  return blobPost("/pdf-to-word", fd, onProgress);
}

/* ───── PDF to Excel ───── */

export async function pdfToExcel(file, onProgress) {
  const fd = new FormData();
  fd.append("file", file);
  return blobPost("/pdf-to-excel", fd, onProgress);
}

/* ───── PDF to PowerPoint ───── */

export async function pdfToPpt(file, onProgress) {
  const fd = new FormData();
  fd.append("file", file);
  return blobPost("/pdf-to-ppt", fd, onProgress);
}

/* ───── Compress PDF ───── */

export async function compressPdf(file, quality, onProgress) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("quality", quality || "medium");
  return blobPost("/compress", fd, onProgress);
}

/* ───── Unlock PDF ───── */

export async function unlockPdf(file, password, onProgress) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("password", password || "");
  return blobPost("/unlock", fd, onProgress);
}

/* ───── Handwriting to PDF ───── */

export async function handwritingToPdf(file, onProgress) {
  const fd = new FormData();
  fd.append("file", file);
  return api
    .post("/handwriting", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "blob",
      timeout: 300_000, // 5 min — GPT-4o Vision processing is slower
      ...makeProgress(onProgress),
    })
    .then((r) => r.data);
}

/* ───── Analytics ───── */

export async function getAnalytics() {
  const response = await api.get("/analytics");
  return response.data;
}

export default api;
