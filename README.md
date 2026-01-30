# Stenny

Meet Stenny!
<p align="center">
  <img src="frontend/stenny.png" alt="Stenny's custom image" width="200"/>
</p>

Stenny is a minimalist real-time transcription application that turns your speech into text instantly. It uses a FastAPI backend powered by Whisper (via `faster-whisper`).

## ✨ Features

-   **Real-time Transcription**: Audio is streamed via WebSockets for low-latency results.
-   **Whisper-Powered**: Uses the highly accurate `faster-whisper` (tiny model for speed).
-   **Premium UI**: A beautiful, responsive interface with smooth animations and dark mode.
-   **Easy Dependency Management**: Powered by `uv` for lightning-fast Python setup.
-   **Unified Serving**: The backend serves the frontend, making it easy to run.

## 🛠️ Tech Stack

-   **Backend**: [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), [faster-whisper](https://github.com/SYSTRAN/faster-whisper)
-   **Frontend**: Vanilla HTML5, CSS3 (Custom Variables, Glassmorphism), JavaScript (MediaRecorder/WebAudio API)
-   **Package Manager**: [uv](https://github.com/astral-sh/uv)

## 🚀 Getting Started

### Prerequisites

-   Python 3.13
-   `uv` installed (`curl -LsSf https://astral.sh/uv/install.sh | sh`)

### Setup & Run

1.  **Clone the repository** (if you haven't):
    ```bash
    git clone https://github.com/LisaBM/stenny.git
    cd stenny
    ```

2.  **Start the Backend**:
    Navigate to the backend directory and run:
    ```bash
    cd backend
    uv run python main.py
    ```
    > [!NOTE]
    > On the first run, the Whisper `tiny` model (75MB) will be downloaded automatically.

3.  **Access the App**:
    Open your browser and navigate to:
    **[http://localhost:8000](http://localhost:8000)**

## 📁 Project Structure

```text
stenny/
├── backend/
│   ├── main.py          # FastAPI server & Transcription logic
│   └── pyproject.toml   # uv dependencies
├── frontend/
│   ├── index.html       # UI Structure
│   ├── style.css        # Premium styling
│   └── script.js        # Audio & WebSocket logic
└── README.md            # This file
```

## 🔧 Troubleshooting

-   **Microphone Access**: Ensure you are using `localhost:8000`. Browsers often block microphone access on non-secure IP addresses.
-   **Performance**: If transcription is slow, ensure you aren't running heavy background tasks. The tiny model is used by default for maximum speed on CPU.
-   **Permissions**: If you get a "Could not access microphone" error, check your browser's site settings to ensure microphone permission is granted.

---
Built with support from Antigravity.
