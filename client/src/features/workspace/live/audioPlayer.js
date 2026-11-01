import { base64ToBytes, pcm16ToFloat32 } from './pcmAudio';

// Plays the assistant's voice. Gemini Live sends 24 kHz mono PCM in small chunks; each chunk is
// scheduled right after the previous one so the speech plays gaplessly.

export const PLAYBACK_SAMPLE_RATE = 24000;

export class AudioPlayer {
  // onDrain runs whenever the last scheduled chunk has finished playing.
  constructor({ onDrain }) {
    this.context = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
    this.onDrain = onDrain;
    this.playing = new Set();
    this.nextStartTime = 0;
    this.context.resume().catch(() => {});
  }

  enqueue(base64Pcm) {
    const samples = pcm16ToFloat32(base64ToBytes(base64Pcm));
    const buffer = this.context.createBuffer(1, samples.length, PLAYBACK_SAMPLE_RATE);
    buffer.copyToChannel(samples, 0);
    this.schedule(buffer);
  }

  schedule(buffer) {
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    this.nextStartTime = Math.max(this.nextStartTime, this.context.currentTime);
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
    this.playing.add(source);
    source.onended = () => this.handleEnded(source);
  }

  handleEnded(source) {
    this.playing.delete(source);
    if (this.playing.size === 0) this.onDrain();
  }

  // The learner started talking over the assistant: drop everything that is queued or playing.
  interrupt() {
    this.playing.forEach((source) => {
      source.onended = null;
      source.stop();
    });
    this.playing.clear();
    this.nextStartTime = 0;
  }

  isIdle() {
    return this.playing.size === 0;
  }

  close() {
    this.interrupt();
    this.context.close().catch(() => {});
  }
}
