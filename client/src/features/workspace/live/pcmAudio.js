// PCM and base64 helpers for the Gemini Live audio stream.
// Live audio is raw 16-bit little-endian mono PCM, sent and received as base64 text.

const BASE64_CHUNK_SIZE = 0x8000;
const PCM16_SCALE = 32768;

export function bytesToBase64(bytes) {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += BASE64_CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + BASE64_CHUNK_SIZE));
  }
  return btoa(binary);
}

export function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// 16-bit PCM to floats in [-1, 1], the sample format the Web Audio API plays.
export function pcm16ToFloat32(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const samples = new Float32Array(Math.floor(bytes.byteLength / 2));
  for (let i = 0; i < samples.length; i += 1) samples[i] = view.getInt16(i * 2, true) / PCM16_SCALE;
  return samples;
}
