# 📁 Mady - Intelligent File Organizer 🤖

A full-stack, cloud-native web application that acts as your personal digital assistant. Mady takes your cluttered folders, automatically categorizes the files (Images, Documents, Videos, etc.), and returns a neatly organized ZIP archive directly from the cloud.

## 🚀 Live Demo
* **Frontend (UI):** [https://mady-frontend.onrender.com](https://mady-frontend.onrender.com)
* **Backend API (Base URL):** [https://mady-a-file-organizer.onrender.com](https://mady-a-file-organizer.onrender.com) 
  *(Note: This is a RESTful API backend and does not serve a web UI at the root endpoint. It listens for POST requests at `/api/organize-zip/`)*

## ✨ Key Features
* **Decoupled Architecture:** Independent React frontend communicating with a Django REST API.
* **In-Memory Processing:** Utilizes Python's `io.BytesIO` to process and zip files directly in RAM without saving them to the server disk, ensuring maximum speed and data privacy.
* **Smart Categorization:** Automatically detects file extensions and groups them into logical folders (e.g., `.pdf` to Documents, `.jpg` to Images).
* **Dockerized:** Fully containerized environment for seamless local development and production consistency.

## 🛠️ Tech Stack
* **Frontend:** React.js (Vite), Axios, HTML/CSS
* **Backend:** Python, Django, Django REST Framework
* **Infrastructure:** Docker, Docker Compose
* **Deployment:** Render (Static Site for Frontend, Web Service for Backend API)

## 💻 Local Setup & Installation

**Prerequisites:** Docker and Docker Desktop installed on your machine.

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/dive0-bit/Mady-File-Organizer.git](https://github.com/dive0-bit/Mady-File-Organizer.git)
   cd Mady-File-Organizer
