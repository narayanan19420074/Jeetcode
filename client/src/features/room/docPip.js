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

const CSS = `
  *{box-sizing:border-box}
  html,body{margin:0;height:100%;background:#232834;overflow:hidden;font-family:system-ui,sans-serif;user-select:none}
  .stage{position:relative;width:220px;height:200px;margin:0 auto}
  .face{position:absolute;left:54px;top:62px;width:112px;height:112px;border-radius:50%;padding:4px;
    background:conic-gradient(from 200deg,#8B5CF6,#06B6D4,#22C55E,#F59E0B,#EC4899,#8B5CF6);
    box-shadow:6px 6px 12px #171a22,-6px -6px 12px #2d3444}
  .face-in{position:relative;width:100%;height:100%;border-radius:50%;overflow:hidden;background:#1b1f2a;
    display:grid;place-items:center;color:#fff;font-weight:700;font-size:40px}
  video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none}
  .btn{position:absolute;width:40px;height:40px;margin:-20px 0 0 -20px;border:0;border-radius:50%;cursor:pointer;
    display:grid;place-items:center;background:#232834;padding:0;
    box-shadow:4px 4px 8px #171a22,-4px -4px 8px #2d3444;transition:box-shadow .12s}
  .btn:active{box-shadow:inset 3px 3px 6px #171a22,inset -3px -3px 6px #2d3444}
  .btn svg{width:22px;height:22px;fill:currentColor}
  #mute{left:46px;top:81px;color:#22C55E}
  #mute.off{color:#EF4444}
  #max{left:110px;top:44px;color:#3B82F6}
  #cut{left:174px;top:81px;color:#F43F5E}
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
    const w = await window.documentPictureInPicture.requestWindow({ width: 220, height: 200 });
    win = w;
    const doc = w.document;
    const style = doc.createElement('style');
    style.textContent = CSS;
    doc.head.appendChild(style);

    const stage = doc.createElement('div');
    stage.className = 'stage';
    stage.innerHTML = `
      <div class="face"><div class="face-in"><video autoplay playsinline muted></video><span id="initial"></span></div></div>
      <button class="btn" id="mute" aria-label="Mute"></button>
      <button class="btn" id="max" aria-label="Maximize" title="Maximize"></button>
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
