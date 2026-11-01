import { bytesToBase64 } from './pcmAudio';

// Microphone capture for Gemini Live: 16 kHz mono 16-bit PCM, delivered as base64 frames.

export const MIC_SAMPLE_RATE = 16000;
const FRAME_SAMPLES = 1600; // 100 ms of audio per frame
const WORKLET_NAME = 'pcm-capture-processor';
const MIC_CONSTRAINTS = { audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } };

// Runs on the audio thread: converts microphone floats to 16-bit PCM and posts one full frame at a time.
const WORKLET_SOURCE = `
class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.frame = new Int16Array(${FRAME_SAMPLES});
    this.filled = 0;
  }
  process(inputs) {
    const channel = inputs[0][0];
    if (!channel) return true;
    for (let i = 0; i < channel.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, channel[i]));
      this.frame[this.filled++] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      if (this.filled === this.frame.length) {
        this.port.postMessage(this.frame.slice().buffer);
        this.filled = 0;
      }
    }
    return true;
  }
}
registerProcessor('${WORKLET_NAME}', PcmCaptureProcessor);
`;

export const isMicCaptureSupported = () =>
  typeof window !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && Boolean(window.AudioContext) && typeof AudioWorkletNode !== 'undefined';

async function loadWorklet(context) {
  const moduleUrl = URL.createObjectURL(new Blob([WORKLET_SOURCE], { type: 'application/javascript' }));
  try {
    await context.audioWorklet.addModule(moduleUrl);
  } finally {
    URL.revokeObjectURL(moduleUrl);
  }
}

// Wires stream -> worklet -> (silent) output. The silent output keeps the audio graph running without playing the mic back.
async function buildPipeline(stream, onFrame) {
  const context = new AudioContext({ sampleRate: MIC_SAMPLE_RATE });
  try {
    await loadWorklet(context);
    const worklet = new AudioWorkletNode(context, WORKLET_NAME);
    worklet.port.onmessage = (event) => onFrame(bytesToBase64(new Uint8Array(event.data)));
    const silence = context.createGain();
    silence.gain.value = 0;
    context.createMediaStreamSource(stream).connect(worklet);
    worklet.connect(silence).connect(context.destination);
    await context.resume();
    return context;
  } catch (error) {
    context.close();
    throw error;
  }
}

// Starts the microphone and calls onFrame(base64Pcm) every 100 ms. Resolves to { stop }.
export async function startMicCapture(onFrame) {
  const stream = await navigator.mediaDevices.getUserMedia(MIC_CONSTRAINTS);
  try {
    const context = await buildPipeline(stream, onFrame);
    return {
      stop: () => {
        stream.getTracks().forEach((track) => track.stop());
        context.close();
      },
    };
  } catch (error) {
    stream.getTracks().forEach((track) => track.stop());
    throw error;
  }
}
