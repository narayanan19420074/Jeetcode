import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import VideocamOffRoundedIcon from '@mui/icons-material/VideocamOffRounded';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { COLOR_PALETTE } from '../../app/design/designTokens';

// Call window that floats over OTHER tabs and other desktop apps (Chrome desktop:
// Document Picture-in-Picture). Just the friend's video with a slim control bar underneath:
// mute, camera, end call, and "return to the page". Phones and browsers without the API keep
// the in-app MiniCallBubble instead.

export const pipSupported = () => typeof window !== 'undefined' && 'documentPictureInPicture' in window;

const W = 300;
const VIDEO_H = 172;
const BAR_H = 48;

const svg = (Icon) => renderToStaticMarkup(createElement(Icon));

const CSS = `
  *{box-sizing:border-box}
  html,body{margin:0;height:100%;background:${COLOR_PALETTE.gray[800]};overflow:hidden;font-family:system-ui,sans-serif;user-select:none}
  .video{position:relative;width:${W}px;height:${VIDEO_H}px;background:${COLOR_PALETTE.gray[950]};overflow:hidden;display:grid;place-items:center;
    color:${COLOR_PALETTE.white};font-weight:700;font-size:56px}
  video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none}
  .bar{display:flex;align-items:center;justify-content:center;gap:14px;height:${BAR_H}px;background:${COLOR_PALETTE.gray[800]};
    box-shadow:inset 0 2px 4px ${COLOR_PALETTE.custom.gray151820}}
  .btn{width:34px;height:34px;border:0;border-radius:50%;cursor:pointer;display:grid;place-items:center;padding:0;
    background:${COLOR_PALETTE.gray[800]};box-shadow:3px 3px 6px ${COLOR_PALETTE.custom.gray151820},-3px -3px 6px ${COLOR_PALETTE.gray[700]};transition:box-shadow .12s,background .12s}
  .btn:hover{background:${COLOR_PALETTE.slate[800]}}
  .btn:active{box-shadow:inset 2px 2px 4px ${COLOR_PALETTE.custom.gray151820},inset -2px -2px 4px ${COLOR_PALETTE.gray[700]}}
  .btn svg{width:19px;height:19px;fill:currentColor}
  /* normal = raised key + coloured icon; ON (muted / camera off) = sunken key tinted red */
  #mute{color:${COLOR_PALETTE.green[500]}}
  #cam{color:${COLOR_PALETTE.cyan[500]}}
  .btn.off{color:${COLOR_PALETTE.red[500]};background:${COLOR_PALETTE.custom.gray2A1F26};box-shadow:inset 2px 2px 4px ${COLOR_PALETTE.custom.gray151820},inset -2px -2px 4px ${COLOR_PALETTE.gray[700]}}
  #cut{color:${COLOR_PALETTE.white};background:${COLOR_PALETTE.rose[500]};box-shadow:3px 3px 6px ${COLOR_PALETTE.custom.gray151820},-3px -3px 6px ${COLOR_PALETTE.gray[700]}}
  #cut:hover{background:${COLOR_PALETTE.rose[400]}}
  #back{color:${COLOR_PALETTE.blue[500]}}
`;

export function createCirclePip(getState, onClosed) {
  let win = null;
  let els = null;

  const update = () => {
    if (!win || !els) return;
    const { remoteStream, micOn, camOn, name } = getState();
    if (els.video.srcObject !== (remoteStream || null)) els.video.srcObject = remoteStream || null;
    const hasVideo = !!remoteStream && remoteStream.getVideoTracks().length > 0;
    els.video.style.display = hasVideo ? 'block' : 'none';
    els.initial.textContent = hasVideo ? '' : (name || '').trim()[0]?.toUpperCase() || '•';
    els.mute.classList.toggle('off', !micOn);
    els.mute.innerHTML = svg(micOn ? MicRoundedIcon : MicOffRoundedIcon);
    els.mute.title = micOn ? 'Mute' : 'Unmute';
    els.cam.classList.toggle('off', !camOn);
    els.cam.innerHTML = svg(camOn ? VideocamRoundedIcon : VideocamOffRoundedIcon);
    els.cam.title = camOn ? 'Turn camera off' : 'Turn camera on';
  };

  const open = async () => {
    if (win || !pipSupported()) return;
    const w = await window.documentPictureInPicture.requestWindow({ width: W, height: VIDEO_H + BAR_H });
    win = w;
    const doc = w.document;
    const style = doc.createElement('style');
    style.textContent = CSS;
    doc.head.appendChild(style);

    doc.body.innerHTML = `
      <div class="video"><video autoplay playsinline muted></video><span id="initial"></span></div>
      <div class="bar">
        <button class="btn" id="mute" aria-label="Mute"></button>
        <button class="btn" id="cam" aria-label="Camera"></button>
        <button class="btn" id="cut" aria-label="End call" title="End call"></button>
        <button class="btn" id="back" aria-label="Return to page" title="Return to page"></button>
      </div>`;

    els = {
      video: doc.querySelector('video'), // muted: the call audio keeps playing from the main tab
      initial: doc.querySelector('#initial'),
      mute: doc.querySelector('#mute'),
      cam: doc.querySelector('#cam'),
    };
    doc.querySelector('#cut').innerHTML = svg(CallEndRoundedIcon);
    doc.querySelector('#back').innerHTML = svg(OpenInNewRoundedIcon);

    els.mute.addEventListener('click', () => {
      getState().actions.toggleMic();
      setTimeout(update, 0);
    });
    els.cam.addEventListener('click', () => {
      getState().actions.toggleCam();
      setTimeout(update, 0);
    });
    doc.querySelector('#back').addEventListener('click', () => {
      w.close();
      getState().actions.maximize();
    });
    doc.querySelector('#cut').addEventListener('click', () => {
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
