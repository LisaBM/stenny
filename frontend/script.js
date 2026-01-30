const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const transcriptionBox = document.getElementById('transcription-box');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');

let audioContext;
let processor;
let source;
let socket;
let stream;

async function initAudio() {
    socket = new WebSocket('ws://localhost:8000/ws');

    socket.onopen = async () => {
        console.log('Connected to backend');
        updateStatus('connected');

        try {
            console.log('Requesting microphone access...');
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone access granted.');

            audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000,
            });

            source = audioContext.createMediaStreamSource(stream);

            // ScriptProcessorNode is deprecated but easier to implement for a simple demo
            // than AudioWorklet. Buffer size 4096 is ~0.25s at 16kHz.
            processor = audioContext.createScriptProcessor(4096, 1, 1);

            source.connect(processor);
            processor.connect(audioContext.destination);

            processor.onaudioprocess = (e) => {
                if (socket.readyState === WebSocket.OPEN) {
                    const inputData = e.inputBuffer.getChannelData(0);
                    // Send raw Float32 PCM data
                    socket.send(inputData.buffer);
                }
            };

            updateStatus('recording');
        } catch (err) {
            console.error('Detailed microphone error:', err);
            alert(`Could not access microphone: ${err.name} - ${err.message}. Please ensure you are using localhost and have granted permission.`);
            stopRecording();
        }
    };

    socket.onmessage = (event) => {
        const text = event.data;
        if (text) {
            displayTranscription(text);
        }
    };

    socket.onclose = () => {
        console.log('Disconnected from backend');
        stopRecording();
        updateStatus('disconnected');
    };

    socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        stopRecording();
    };
}

function stopRecording() {
    if (processor) {
        processor.disconnect();
        processor = null;
    }
    if (source) {
        source.disconnect();
        source = null;
    }
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
    }
    if (socket) {
        socket.close();
        socket = null;
    }

    startBtn.disabled = false;
    stopBtn.disabled = true;
    updateStatus('connected');
}

function displayTranscription(text) {
    // For real-time, we usually overwrite the current segment
    // or append if it's a new one. In our simple backend, 
    // we send the full transcription of the current session.
    transcriptionBox.innerHTML = `<p>${text}</p>`;
    // Auto scroll to bottom
    transcriptionBox.scrollTop = transcriptionBox.scrollHeight;
}

function updateStatus(status) {
    statusIndicator.className = 'indicator';
    if (status === 'connected') {
        statusIndicator.classList.add('connected');
        statusText.innerText = 'Connected to Backend';
    } else if (status === 'recording') {
        statusIndicator.classList.add('recording');
        statusText.innerText = 'Recording...';
    } else {
        statusText.innerText = 'Disconnected';
    }
}

startBtn.addEventListener('click', () => {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    transcriptionBox.innerHTML = '<p class="placeholder">Listening...</p>';
    initAudio();
});

stopBtn.addEventListener('click', () => {
    stopRecording();
});
