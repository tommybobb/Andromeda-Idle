// Parallax starfield behind the HUD. Runs at ~30fps and sleeps when the tab is
// hidden or the player turns it off.

let canvas;
let ctx;
let stars = [];
let w = 0;
let h = 0;
let dpr = 1;
let enabled = true;
let animate = true;
let last = 0;
let raf = 0;
let shooting = null;

const COLOURS = ['#ffffff', '#ffe9d6', '#d6e8ff', '#ffd2a1', '#bcd7ff'];

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(420, Math.floor((w * h) / 4200));
  stars = [];
  for (let i = 0; i < count; i++) {
    const layer = Math.random() < 0.65 ? 0 : Math.random() < 0.75 ? 1 : 2;
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: [0.5, 0.9, 1.4][layer] * (0.7 + Math.random() * 0.6),
      speed: [1.5, 4, 9][layer],
      tw: Math.random() * Math.PI * 2,
      c: COLOURS[Math.floor(Math.random() * COLOURS.length)],
      a: 0.35 + Math.random() * 0.6,
    });
  }
  draw(0);
}

function draw(dt) {
  ctx.clearRect(0, 0, w, h);
  const t = performance.now() / 1000;
  for (const s of stars) {
    if (dt) {
      s.x -= (s.speed * dt) / 1000;
      if (s.x < -2) {
        s.x = w + 2;
        s.y = Math.random() * h;
      }
    }
    const twinkle = animate ? 0.75 + 0.25 * Math.sin(t * 1.7 + s.tw) : 1;
    ctx.globalAlpha = s.a * twinkle;
    ctx.fillStyle = s.c;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  if (animate) {
    if (!shooting && Math.random() < dt / 9000) {
      shooting = { x: Math.random() * w, y: Math.random() * h * 0.5, vx: -(300 + Math.random() * 300), vy: 120 + Math.random() * 120, life: 1 };
    }
    if (shooting) {
      const s = shooting;
      s.x += (s.vx * dt) / 1000;
      s.y += (s.vy * dt) / 1000;
      s.life -= dt / 900;
      const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 0.12, s.y - s.vy * 0.12);
      g.addColorStop(0, 'rgba(255,220,180,0.9)');
      g.addColorStop(1, 'rgba(255,220,180,0)');
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 0.12, s.y - s.vy * 0.12);
      ctx.stroke();
      if (s.life <= 0) shooting = null;
    }
  }
  ctx.globalAlpha = 1;
}

function frame(now) {
  raf = 0;
  if (!enabled || !animate || document.hidden) return;
  const dt = Math.min(100, now - last);
  if (dt >= 33) {
    last = now;
    draw(dt);
  }
  raf = requestAnimationFrame(frame);
}

function kick() {
  if (!raf && enabled && animate && !document.hidden) {
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
}

export function initStarfield(el) {
  canvas = el;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', kick);
  kick();
}

export function setStarfield(on, motion = true) {
  enabled = on;
  animate = motion && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canvas) return;
  canvas.style.display = on ? '' : 'none';
  if (on) {
    draw(0);
    kick();
  }
}
