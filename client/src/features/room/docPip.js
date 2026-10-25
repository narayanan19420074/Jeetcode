import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';

// Floating call window that stays on top of OTHER tabs / apps (Chrome desktop:
// Document Picture-in-Picture). Same layout as the in-app MiniCallBubble.
// Phones and browsers without the API simply keep the in-app bubble.

export const pipSupported = () => typeof window !== 'undefined' && 'documentPictureInPicture' in window;

const svg = (Icon) => renderToStaticMarkup(createElement(Icon));

const S = 176;
const c = (deg, r = 65) => ({ x: S / 2 + r * Math.cos((deg * Math.PI) / 180), y: S / 2 + r * Math.sin((deg * Math.PI) / 180) });
const pMax = c(-90);
const pMute = c(30);
const pCut = c(150);

const CSS = `
  *{box-sizing:border-box}
  html,body{margin:0;height:100%;background:#232834;overflow:hidden;font-family:system-ui,sans-serif;user-select:none}
  .watch{position:absolute;left:0;top:0;width:${S}px;height:${S}px;border-radius:50%;
    background:linear-gradient(145deg,#2f3647,#232834 55%,#151820)}
  .channel{position:absolute;left:8px;top:8px;width:160px;height:160px;border-radius:50%;background:#232834;
    box-shadow:inset 4px 4px 8px #151820,inset -4px -4px 8px #2f3647}
  .glass{position:absolute;left:38px;top:38px;width:100px;height:100px;padding:3px;border-radius:50%;
    background:conic-gradient(from 200deg,#8B5CF6,#06B6D4,#22C55E,#F59E0B,#EC4899,#8B5CF6);
    box-shadow:3px 3px 6px #151820,-3px -3px 6px #2f3647}
  .glass-in{position:relative;width:100%;height:100%;border-radius:50%;overflow:hidden;background:#1b1f2a;
    display:grid;place-items:center;color:#fff;font-weight:700;font-size:36px}
  video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none}
  .btn{position:absolute;width:26px;height:26px;margin:-13px 0 0 -13px;border:0;border-radius:50%;cursor:pointer;
    display:grid;place-items:center;background:#232834;padding:0;
    box-shadow:2px 2px 4px #151820,-2px -2px 4px #2f3647}
  .btn:active{box-shadow:inset 2px 2px 4px #151820,inset -2px -2px 4px #2f3647}
  .btn svg{width:16px;height:16px;fill:currentColor}
  #max{left:${pMax.x}px;top:${pMax.y}px;color:#3B82F6}
  #mute{left:${pMute.x}px;top:${pMute.y}px;color:#22C55E}
  #mute.off{color:#EF4444}
  #cut{left:${pCut.x}px;top:${pCut.y}px;color:#F43F5E}
`;

export function createCirclePip(getState, onClosed) {
  let win = null;
  let els = null;

  const update = () => {
    if (!win || !els) return;
    const { remoteStream, micOn, name } = getState();
    if (els.video.srcObject !== (remoteStream || null)) els.video.srcObject = remoteStream || null;
    const hasVideo = !!remoteStream && remoteStream.getVideoTracks().length > 0;
    els.video.style.display = hasVideo ? 'block' : 'none';
    els.initial.textContent = hasVideo ? '' : (name || '').trim()[0]?.toUpperCase() || '•';
    els.mute.classList.toggle('off', !micOn);
    els.mute.innerHTML = svg(micOn ? MicRoundedIcon : MicOffRoundedIcon);
    els.mute.title = micOn ? 'Mute' : 'Unmute';
  };

  const open = async () => {
    if (win || !pipSupported()) return;
    const w = await window.documentPictureInPicture.requestWindow({ width: S, height: S });
    win = w;
    const doc = w.document;
    const style = doc.createElement('style');
    style.textContent = CSS;
    doc.head.appendChild(style);

    const stage = doc.createElement('div');
    stage.className = 'watch';
    stage.innerHTML = `
      <div class="channel"></div>
      <div class="glass"><div class="glass-in"><video autoplay playsinline muted></video><span id="initial"></span></div></div>
      <button class="btn" id="max" aria-label="Maximize" title="Maximize"></button>
      <button class="btn" id="mute" aria-label="Mute"></button>
      <button class="btn" id="cut" aria-label="End call" title="End call"></button>`;
    doc.body.appendChild(stage);

    els = {
      video: stage.querySelector('video'), // muted: the call audio keeps playing from the main tab
      initial: stage.querySelector('#initial'),
      mute: stage.querySelector('#mute'),
    };
    stage.querySelector('#max').innerHTML = svg(OpenInFullRoundedIcon);
    stage.querySelector('#cut').innerHTML = svg(CallEndRoundedIcon);

    els.mute.addEventListener('click', () => {
      getState().actions.toggleMic();
      setTimeout(update, 0);
    });
    stage.querySelector('#max').addEventListener('click', () => {
      w.close();
      getState().actions.maximize();
    });
    stage.querySelector('#cut').addEventListener('click', () => {
      w.close();
      getState().actions.cut();
    });
    w.addEventListener('pagehide', () => {
      win = null;
      els = null;
      onClosed?.();
    });
    update();
  };

  return {
    open,
    update,
    close: () => {
      win?.close();
      win = null;
      els = null;
    },
  };
}
