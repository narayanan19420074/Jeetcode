import { AudioPlayer } from './audioPlayer';
import { buildCodeUpdateTurn, connectGeminiLive } from './liveConnection';
import { describeLiveError } from './liveErrors';
import { startMicCapture } from './micCapture';

const MIC_MIME_TYPE = 'audio/pcm;rate=16000';
// Typing sends many edits; the assistant only needs the code once the learner pauses.
const CODE_SYNC_DELAY_MS = 1500;
const SESSION_ENDED_MESSAGE = 'The live session ended. Tap the microphone to start again.';

export const LIVE_PHASE = { idle: 'idle', connecting: 'connecting', listening: 'listening', speaking: 'speaking', error: 'error' };

// One Gemini Live voice conversation: opens the connection, streams the microphone up, plays the
// assistant's voice, and keeps the assistant's copy of the learner's code current.
// Plain class (no React) so the hook stays thin. Once close() or an error ends it, create a new one.
//   events: { onPhase(phase), onTranscript({ user, model }), onError(message) }
export class LiveVoiceSession {
  constructor(events) {
    this.events = events;
    this.session = null;
    this.mic = null;
    this.player = null;
    this.closed = false;
    this.muted = false;
    this.phase = LIVE_PHASE.idle;
    this.modelTurnComplete = true;
    this.transcript = { user: '', model: '' };
    this.syncedCode = null;
    this.codeTimer = null;
  }

  async start({ fetchCredentials, language, code }) {
    this.setPhase(LIVE_PHASE.connecting);
    try {
      const credentials = await fetchCredentials();
      this.player = new AudioPlayer({ onDrain: () => this.handleDrain() });
      this.session = await connectGeminiLive({ credentials, callbacks: this.buildCallbacks() });
      // The learner may close the overlay while we are still connecting: release what was just opened.
      if (this.closed) return this.close();
      this.sendCode(language, code);
      this.mic = await startMicCapture((frame) => this.sendMicFrame(frame));
      if (this.closed) return this.close();
      return this.setPhase(LIVE_PHASE.listening);
    } catch (error) {
      return this.fail(error);
    }
  }

  buildCallbacks() {
    return {
      onmessage: (message) => this.handleMessage(message),
      onerror: () => this.fail(new Error('The live connection failed. Please try again.')),
      onclose: (event) => this.fail(new Error(event?.reason || SESSION_ENDED_MESSAGE)),
    };
  }

  handleMessage(message) {
    const content = message.serverContent;
    if (!content || this.closed) return;
    if (content.interrupted) this.handleInterruption();
    for (const part of content.modelTurn?.parts ?? []) {
      if (part.inlineData?.data) this.playAudio(part.inlineData.data);
    }
    if (content.inputTranscription?.text) this.appendTranscript('user', content.inputTranscription.text);
    if (content.outputTranscription?.text) this.appendTranscript('model', content.outputTranscription.text);
    if (content.turnComplete) this.handleTurnComplete();
  }

  playAudio(base64Pcm) {
    this.modelTurnComplete = false;
    this.player.enqueue(base64Pcm);
    this.setPhase(LIVE_PHASE.speaking);
  }

  // The learner spoke over the assistant: stop its voice at once.
  handleInterruption() {
    this.player.interrupt();
    this.modelTurnComplete = true;
    this.setPhase(LIVE_PHASE.listening);
  }

  handleTurnComplete() {
    this.modelTurnComplete = true;
    if (this.player.isIdle()) this.setPhase(LIVE_PHASE.listening);
  }

  // Audio chunks arrive before the end of the turn, so playback can run dry between chunks;
  // only go back to listening once the turn is really over.
  handleDrain() {
    if (this.modelTurnComplete) this.setPhase(LIVE_PHASE.listening);
  }

  // A new learner utterance after an assistant reply starts a fresh caption.
  appendTranscript(speaker, text) {
    if (speaker === 'user' && this.transcript.model) this.transcript = { user: '', model: '' };
    this.transcript = { ...this.transcript, [speaker]: this.transcript[speaker] + text };
    this.events.onTranscript(this.transcript);
  }

  sendMicFrame(frame) {
    if (this.muted) return;
    this.safeSend(() => this.session.sendRealtimeInput({ audio: { data: frame, mimeType: MIC_MIME_TYPE } }));
  }

  setMuted(muted) {
    this.muted = muted;
    // Tell Gemini the audio stream paused so it answers what it has already heard.
    if (muted) this.safeSend(() => this.session.sendRealtimeInput({ audioStreamEnd: true }));
  }

  // Debounced: called on every edit, sends the code once the learner stops typing.
  updateCode(language, code) {
    clearTimeout(this.codeTimer);
    this.codeTimer = setTimeout(() => this.sendCode(language, code), CODE_SYNC_DELAY_MS);
  }

  sendCode(language, code) {
    const snapshot = `${language}\n${code}`;
    if (!this.session || snapshot === this.syncedCode) return;
    this.syncedCode = snapshot;
    this.safeSend(() => this.session.sendClientContent({ turns: [buildCodeUpdateTurn(language, code)], turnComplete: false }));
  }

  // The socket can close at any moment; a failed send is reported through the close callback instead.
  safeSend(send) {
    if (this.closed || !this.session) return;
    try {
      send();
    } catch {
      /* connection already closing */
    }
  }

  setPhase(phase) {
    if (this.closed || this.phase === phase) return;
    this.phase = phase;
    this.events.onPhase(phase);
  }

  fail(error) {
    if (this.closed) return;
    this.setPhase(LIVE_PHASE.error);
    this.events.onError(describeLiveError(error));
    this.close();
  }

  close() {
    this.closed = true;
    clearTimeout(this.codeTimer);
    this.mic?.stop();
    this.player?.close();
    try {
      this.session?.close();
    } catch {
      /* already closed */
    }
    this.mic = null;
    this.player = null;
    this.session = null;
  }
}
