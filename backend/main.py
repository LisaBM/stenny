import asyncio
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from faster_whisper import WhisperModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Mount the frontend directory to serve static files
# This allows opening http://localhost:8000 to see the UI
import pathlib
frontend_dir = pathlib.Path(__file__).parent.parent / "frontend"
logger.info(f"Frontend directory: {frontend_dir}")
app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

@app.get("/")
async def get():
    from fastapi.responses import FileResponse
    return FileResponse(frontend_dir / "index.html")

# Load Whisper model (tiny for speed)
# Using CPU and int8 for broad compatibility and speed
logger.info("Loading Whisper model...")
model = WhisperModel("tiny", device="cpu", compute_type="int8")
logger.info("Whisper model loaded.")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection established.")
    
    # Buffer to store audio chunks
    audio_buffer = []
    
    try:
        while True:
            # Receive audio bytes from the client
            # The client should send raw PCM data (Float32 or Int16)
            data = await websocket.receive_bytes()
            
            # Convert bytes to numpy array
            # Expecting Float32 encoded audio at 16kHz
            chunk = np.frombuffer(data, dtype=np.float32)
            audio_buffer.append(chunk)
            
            # Combine buffer for transcription
            # In a more advanced implementation, we would use a sliding window
            # but for "simple", we'll just transcribe the whole buffer if it's not too long
            # or just the latest chunk.
            # To make it feel real-time, let's transcribe the current session's audio.
            
            full_audio = np.concatenate(audio_buffer)
            
            # limit buffer size to 30 seconds for simplicity and performance
            if len(full_audio) > 16000 * 30:
                audio_buffer = [full_audio[-(16000 * 10):]] # Keep last 10 seconds
                full_audio = audio_buffer[0]

            # Transcribe the audio
            # we use beam_size=1 for maximum speed in real-time
            segments, info = model.transcribe(full_audio, beam_size=1, language="en")
            
            transcription = "".join([segment.text for segment in segments])
            
            if transcription:
                await websocket.send_text(transcription.strip())
                
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected.")
    except Exception as e:
        logger.error(f"Error in transcription loop: {e}")
    finally:
        try:
            await websocket.close()
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Stenny at http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
