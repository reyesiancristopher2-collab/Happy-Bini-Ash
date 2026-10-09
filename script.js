// ✏️ Edit these
const CONFIG = {
  greeting: "happy birthday!",
  name: "Ashlyn Mae Garbo Binamira Jr."
};

const $ = (id) => document.getElementById(id);
$("greeting").textContent = CONFIG.greeting;
$("name").textContent = CONFIG.name;
document.title = `Happy Birthday, ${CONFIG.name}!`;

/* ---------- sound ---------- */
let ctx, master, muted = false;

function ensureAudio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
}

function playNote(freq, start, dur) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(.45, start + .03);
  g.gain.exponentialRampToValueAtTime(.001, start + dur * .95);
  o.connect(g).connect(master);
  o.start(start);
  o.stop(start + dur);
}

// Your own song (song.mp3 in the same folder)
function playSong() {
  const a = $("song");
  a.currentTime = 0;
  a.muted = muted;
  a.play().catch(() => {}); // ok lang kahit wala pang song.mp3
}

function poof() {
  ensureAudio();
  const len = ctx.sampleRate * .35;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  const filt = ctx.createBiquadFilter();
  filt.type = "lowpass"; filt.frequency.value = 900;
  src.buffer = buf;
  src.connect(filt).connect(master);
  src.start();
}

function cheer() {
  // little rising sparkle after the candle is blown out
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => playNote(f, ctx.currentTime + .35 + i * .12, .4));
}

/* ---------- interactions ---------- */
$("open").addEventListener("click", () => {
  ensureAudio();
  $("intro").classList.add("gone");
  document.body.classList.add("show");
  setTimeout(playSong, 2400); // start the song as the candle lights
});

let lit = true;
function toggleCandle() {
  if (!document.body.classList.contains("show")) return;
  const flame = $("flame");
  if (lit) {
    lit = false;
    flame.classList.add("out");
    poof();
    cheer();
    confetti();
    $("hint").textContent = "Your wish will come true 💖 (tap again to relight)";
  } else {
    lit = true;
    flame.classList.remove("out");
    flame.style.animation = "";
    $("hint").textContent = "Tap the candle to make a wish ✨";
  }
}
$("cake").addEventListener("click", toggleCandle);
$("cake").addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCandle(); }
});

$("mute").addEventListener("click", () => {
  muted = !muted;
  $("song").muted = muted;
  if (master) master.gain.value = muted ? 0 : 0.5;
  $("mute").textContent = muted ? "🔇" : "🔊";
});
$("replay").addEventListener("click", playSong);

/* ---------- confetti ---------- */
function confetti() {
  const bits = ["🎉", "🎊", "💖", "✨", "🌸", "🎈"];
  for (let i = 0; i < 36; i++) {
    const el = document.createElement("span");
    el.className = "bit";
    el.textContent = bits[i % bits.length];
    el.style.left = Math.random() * 100 + "vw";
    el.style.fontSize = 18 + Math.random() * 16 + "px";
    el.style.animationDuration = 2.5 + Math.random() * 2.5 + "s";
    el.style.animationDelay = Math.random() * .8 + "s";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 6500);
  }
}