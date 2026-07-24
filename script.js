const SHEET_URL = "https://script.google.com/macros/s/AKfycbzw5iRPB9UPhVSZbeWP3CAYdoekyeCaO8_KEU2tC9VecsH9pbr9rD-OsICPynOpin0/exec";

const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const overlay = document.getElementById('overlay');
const closeOverlay = document.getElementById('closeOverlay');
const footerNote = document.getElementById('footerNote');

// ---- sound effects kecil, dibuat langsung pakai Web Audio API ----
// (gak butuh file suara eksternal, jadi gak akan "putus" kayak file terpisah)
let audioCtx = null;
function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq, startTime, duration, type = 'sine', gainPeak = 0.2) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

// bunyi "cha-ching" ceria buat tombol iya
function playYesSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6, naik gembira
  notes.forEach((freq, i) => {
    playTone(freq, now + i * 0.09, 0.35, 'triangle', 0.18);
  });
}

// bunyi "boing" lucu buat tombol mikir dulu
function playNoSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

// bunyi lonceng pintu kedai, kayak masuk cafe, dipicu interaksi pertama
function playBellSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  playTone(1318.5, now, 0.5, 'sine', 0.12);       // E6
  playTone(1567.98, now + 0.12, 0.5, 'sine', 0.1); // G6
}

// bunyi "pop" pas nutup pop-up
function playPopSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(500, now + 0.08);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

// bunyi kecil "tik" ala keyboard, buat nemenin blok kode
function playTypingTick() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(900 + Math.random() * 300, now);
  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

// bel kedai dibunyikan begitu Rara pertama kali menyentuh halaman
// (browser butuh interaksi user dulu sebelum audio boleh main)
let bellPlayed = false;
function ringBellOnce() {
  if (bellPlayed) return;
  bellPlayed = true;
  playBellSound();
  document.removeEventListener('click', ringBellOnce);
  document.removeEventListener('keydown', ringBellOnce);
}
document.addEventListener('click', ringBellOnce);
document.addEventListener('keydown', ringBellOnce);

// balesan iseng tiap kali tombol "mikir dulu" dipencet
const godaan = [
  'mikir dulu',
  'yakin nih mikir?',
  'kopinya keburu dingin lho',
  'aku udah siapin helm ekstra',
  'jemputannya limited edition',
  'oke oke, iya aja dulu deh'
];
let godaanIndex = 0;

noBtn.addEventListener('click', () => {
  playNoSound();
  godaanIndex = (godaanIndex + 1) % godaan.length;
  noBtn.textContent = godaanIndex === 0 ? 'mikir dulu' : godaan[godaanIndex];

  // sedikit gerak menghindar biar lucu, tapi tetap bisa dijangkau
  const shiftX = (Math.random() - 0.5) * 40;
  const shiftY = (Math.random() - 0.5) * 16;
  noBtn.style.transform = `translate(${shiftX}px, ${shiftY}px)`;

  if (godaanIndex === godaan.length - 1) {
    footerNote.textContent = 'udah ketauan kok iya, ayo klik yang satunya 👉';
  }
});

yesBtn.addEventListener('click', () => {
  playYesSound();
  overlay.classList.add('show');
});

closeOverlay.addEventListener('click', () => {
  playPopSound();
  overlay.classList.remove('show');
});

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) overlay.classList.remove('show');
});

// bunyi "tik" ala keyboard nyala satu-satu pas blok kode muncul di layar
const codeBlock = document.querySelector('.code-block');
let codeSoundPlayed = false;
if ('IntersectionObserver' in window && codeBlock) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !codeSoundPlayed) {
        codeSoundPlayed = true;
        let i = 0;
        const tickCount = 10;
        const interval = setInterval(() => {
          playTypingTick();
          i++;
          if (i >= tickCount) clearInterval(interval);
        }, 55);
        observer.disconnect();
      }
    });
  }, { threshold: 0.6 });
  observer.observe(codeBlock);
}
