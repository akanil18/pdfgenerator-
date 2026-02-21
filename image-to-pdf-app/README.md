# 🖼️ Image to PDF Converter

A modern, production-ready web application that converts multiple images into a single PDF document. Built with **React + Vite** on the frontend and **FastAPI** on the backend.

![Tech Stack](https://img.shields.io/badge/React-Vite-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-Python-green) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v3-06B6D4)

---

## ✨ Features

- 📤 **Drag & Drop Upload** — drop images directly onto the upload zone
- 🖼️ **Image Preview Grid** — see thumbnails of all your images
- 🔀 **Drag to Reorder** — reorder pages before conversion
- ❌ **Remove Images** — click to remove any image
- 📄 **One-Click PDF** — merge all images into a single PDF
- ⬇️ **Instant Download** — PDF downloads automatically
- 🎨 **Modern UI** — SaaS-quality design with smooth animations
- 📱 **Fully Responsive** — works on desktop, tablet, and mobile
- ⚡ **Fast Conversion** — async processing with Pillow

---

## 🏗️ Tech Stack

| Layer    | Technology                                                    |
| -------- | ------------------------------------------------------------- |
| Frontend | React 18, Vite 5, Tailwind CSS 3, Framer Motion, Axios       |
| Backend  | Python 3.10+, FastAPI, Pillow, Uvicorn                        |
| DnD      | @hello-pangea/dnd (maintained fork of react-beautiful-dnd)    |
| Icons    | Lucide React                                                  |
| Toasts   | react-hot-toast                                               |

---

## 📁 Project Structure

```
image-to-pdf-app/
│
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── routes/
│   │   │   └── convert.py       # POST /api/convert
│   │   ├── services/
│   │   │   └── pdf_service.py   # Image → PDF logic
│   │   └── utils/
│   │       └── file_handler.py  # File validation & temp management
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── UploadZone.jsx
    │   │   ├── ImagePreview.jsx
    │   │   ├── ConvertButton.jsx
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   └── Home.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** installed
- **Node.js 18+** and **npm** installed

---

### 1. Clone / Navigate to the project

```bash
cd image-to-pdf-app
```

### 2. Backend Setup

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is now running at **http://localhost:8000**.  
Swagger docs at **http://localhost:8000/docs**.

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app is now running at **http://localhost:5173**.

---

## 📡 API Reference

### `POST /api/convert`

Convert multiple images into a single PDF.

| Parameter | Type                   | Description           |
| --------- | ---------------------- | --------------------- |
| `files`   | `multipart/form-data`  | One or more image files |

**Success Response:** `200 OK` — returns `application/pdf` stream.

**Error Responses:**

| Code | Description               |
| ---- | ------------------------- |
| 400  | No files / invalid type   |
| 400  | File too large (> 10 MB)  |
| 422  | Corrupted / unreadable    |
| 500  | Internal server error     |

---

## ⚙️ Configuration

Environment variables in `backend/.env`:

| Variable            | Default                                    | Description                |
| ------------------- | ------------------------------------------ | -------------------------- |
| `HOST`              | `0.0.0.0`                                 | Server host                |
| `PORT`              | `8000`                                     | Server port                |
| `ALLOWED_ORIGINS`   | `http://localhost:5173`                    | CORS origins (comma-sep)   |
| `MAX_FILE_SIZE_MB`  | `10`                                       | Max upload size per file   |
| `ALLOWED_EXTENSIONS`| `.jpg,.jpeg,.png,.bmp,.gif,.webp,.tiff`    | Accepted image formats     |
| `TEMP_DIR`          | `temp_files`                               | Temporary file directory   |

---

## 🧪 Error Handling

The backend validates:

- ✅ File extension (must be an image format)
- ✅ File size (max 10 MB per file)
- ✅ Image integrity (Pillow opens & converts)
- ✅ At least one file required
- ✅ Graceful cleanup on any error

---

## 📱 Responsive Design

The UI adapts seamlessly across:

- 🖥️ **Desktop** — full grid layout
- 📱 **Tablet** — responsive grid
- 📱 **Mobile** — stacked layout with touch-friendly targets

---

## 🔒 Production Notes

- CORS is configured via environment variables
- Temporary files are cleaned up on shutdown and after each request
- Async routes for non-blocking I/O
- Supports 20+ images in a single batch
- Proper logging throughout the backend

---

## 📄 License

MIT — feel free to use and modify.
