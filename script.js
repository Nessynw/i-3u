const ui = document.getElementById('ui');
const particlesContainer = document.getElementById('particles');
const hint = document.getElementById('hint');
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

const auroraColors = [
    '#6d6d6d', 
    '#ffc371', 
    '#cacbcb', 
    '#9581b6',
];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

//background
let auroraTime = 0;

const blobs = Array.from({ length: 6 }, (_, i) => ({
  x: Math.random(),
  y: Math.random(),
  r: 0.25 + Math.random() * 0.2,
  speedX: (Math.random() - 0.5) * 0.0003,
  speedY: (Math.random() - 0.5) * 0.0002,
  color: auroraColors[i % auroraColors.length],
  phase: Math.random() * Math.PI * 2
}));

function drawAurora() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000008';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw aurora blobs
  blobs.forEach(b => {
    b.x += b.speedX;
    b.y += b.speedY;
    if (b.x < 0) b.x = 1;
    if (b.x > 1) b.x = 0;
    if (b.y < 0) b.y = 1;
    if (b.y > 1) b.y = 0;

    const pulse = 0.3 + 0.15 * Math.sin(auroraTime * 0.5 + b.phase);
    const grd = ctx.createRadialGradient(
      b.x * canvas.width, b.y * canvas.height, 0,
      b.x * canvas.width, b.y * canvas.height, b.r * Math.min(canvas.width, canvas.height)
    );
    grd.addColorStop(0, b.color + Math.floor(pulse * 99).toString(16).padStart(2, '0'));
    grd.addColorStop(1, 'transparent');

    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(
      b.x * canvas.width, b.y * canvas.height,
      b.r * canvas.width * (0.8 + 0.2 * Math.sin(auroraTime * 0.3 + b.phase)),
      b.r * canvas.height * (0.5 + 0.2 * Math.cos(auroraTime * 0.4 + b.phase)),
      auroraTime * 0.05 + b.phase, 0, Math.PI * 2
    );
    ctx.fill();
  });

  // Stars
  ctx.globalCompositeOperation = 'source-over';

  auroraTime += 0.01;
  requestAnimationFrame(drawAurora);
}


function drawStars() {
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 1.2;
    const alpha = 0.3 + Math.random() * 0.7;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }
}

drawAurora();
setTimeout(drawStars, 100);

// construire le coeur 
const numLines = 60;
const text = 'I love you ';
const lines = [];

for (let i = 0; i < numLines; i++) {
  const t = (i / numLines) * Math.PI * 2;

  const hx = 16 * Math.pow(Math.sin(t), 3);
  const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

  const scale = 14;
  const x = hx * scale;
  const y = hy * scale;

  const dt = 0.01;
  const hx2 = 16 * Math.pow(Math.sin(t + dt), 3);
  const hy2 = -(13 * Math.cos(t + dt) - 5 * Math.cos(2 * (t + dt)) - 2 * Math.cos(3 * (t + dt)) - Math.cos(4 * (t + dt)));
  const tangentAngle = Math.atan2(hy2 - hy, hx2 - hx) * (180 / Math.PI);

  const r = Math.sqrt(x * x + y * y);
  const baseAngle = Math.atan2(y, x) * (180 / Math.PI);

  const color = auroraColors[i % auroraColors.length];

  const div = document.createElement('div');
  div.className = 'love_horizontal';
  div.style.cssText = `
    --angle: ${baseAngle}deg;
    --r1: ${r * 0.92}px;
    --r2: ${r * 1.08}px;
    animation-delay: calc(${i} * -300ms);
  `;

  const span = document.createElement('span');
  span.className = 'love_word';
  span.style.transform = `translateY(-50%) rotateZ(${tangentAngle - baseAngle - 30}deg)`;
  span.style.color = color;
  span.style.textShadow = `0 0 8px ${color}, 0 0 20px #fff, 0 0 40px ${color}`;
  span.textContent = text.repeat(3);

  div.appendChild(span);
  ui.appendChild(div);

  lines.push({ div, x, y, color, baseAngle, r });
}
//web audio api for the sounds 
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
}

function playShatter() {
  ensureAudio();
  // Burst of noise
  const bufferSize = audioCtx.sampleRate * 0.3;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 0.8;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();

  // Low thud
  const osc = audioCtx.createOscillator();
  const g2 = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.3);
  g2.gain.setValueAtTime(0.5, audioCtx.currentTime);
  g2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  osc.connect(g2);
  g2.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}

function playReform() {
  ensureAudio();
  // audio for reforming - rising pitch 
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.8);
  gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.8);
}

let isBroken = false;
let reformTimeout = null;

function shatterHeart() {
  if (isBroken) return;
  isBroken = true;

  playShatter();
  hint.textContent = 'Reforming... 💫';

  // Trigger CSS shatter on #ui
  ui.classList.add('broken');

  // Spawn shards from center
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  lines.forEach((line, i) => {
    setTimeout(() => {
      const shard = document.createElement('div');
      shard.className = 'shard';
      shard.textContent = 'I love you';

      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 250;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const dur = 600 + Math.random() * 500;
      const rot = -360 + Math.random() * 720;

      shard.style.cssText = `
        left: ${cx}px;
        top: ${cy}px;
        --dx: ${dx}px;
        --dy: ${dy}px;
        --dur: ${dur}ms;
        --rot: ${rot}deg;
        --color: ${line.color};
        animation-delay: ${i * 8}ms;
      `;

      particlesContainer.appendChild(shard);
      setTimeout(() => shard.remove(), dur + i * 8 + 200);
    }, i * 5);
  });

  // Reform heart après un délai
  reformTimeout = setTimeout(() => {
    reformHeart();
  }, 2500);
}

function reformHeart() {
  playReform();
  hint.textContent = 'Click to break ❤️';

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  lines.forEach((line, i) => {
    setTimeout(() => {
      const shard = document.createElement('div');
      shard.className = 'shard reform';
      shard.textContent = 'I love you';

      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 250;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const dur = 800 + Math.random() * 400;
      const rot = -360 + Math.random() * 720;

      shard.style.cssText = `
        left: ${cx}px;
        top: ${cy}px;
        --dx: ${dx}px;
        --dy: ${dy}px;
        --dur: ${dur}ms;
        --rot: ${rot}deg;
        --color: ${line.color};
        animation-delay: ${i * 6}ms;
      `;

      particlesContainer.appendChild(shard);
      setTimeout(() => shard.remove(), dur + i * 6 + 200);
    }, i * 5);
  });

  setTimeout(() => {
    ui.classList.remove('broken');
    isBroken = false;
  }, 1200);
}

document.addEventListener('click', shatterHeart);