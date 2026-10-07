// Synthesizes the promo soundtrack to public/music.wav. No samples, no dependencies.
// 120 BPM, 4/4, so one bar = 2 s. Scene cuts in the video land on bars:
// 0 problem · 8 brand · 12 search · 18 results · 26 guardrail · 32 outro · 40 end.
import { mkdirSync, writeFileSync } from "node:fs";

const SR = 44100;
const DUR = 40;
const N = SR * DUR;
const BEAT = 0.5;
const BAR = BEAT * 4;
const S16 = BEAT / 4;

const synthL = new Float32Array(N);
const synthR = new Float32Array(N);
const drumL = new Float32Array(N);
const drumR = new Float32Array(N);
const send = new Float32Array(N);
const duck = new Float32Array(N).fill(1);

let seed = 7;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const noise = () => rand() * 2 - 1;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
const lpCoef = (c) => 1 - Math.exp((-2 * Math.PI * c) / SR);

function write(L, R, i, v, pan, sendAmt) {
  if (i < 0 || i >= N) return;
  const a = ((pan + 1) * Math.PI) / 4;
  L[i] += v * Math.cos(a);
  R[i] += v * Math.sin(a);
  if (sendAmt) send[i] += v * sendAmt;
}

// Band-limited saw-ish tone (additive), one-pole lowpass, AR envelope with optional decay.
function tone(t0, dur, freq, o = {}) {
  const {
    gain = 0.2, pan = 0, attack = 0.005, release = 0.1, harmonics = 1,
    cutoff = 18000, cutoffEnd = cutoff, send: sendAmt = 0, decay = 0,
  } = o;
  const start = Math.round(t0 * SR);
  const len = Math.round((dur + release) * SR);
  let lp = 0;
  for (let n = 0; n < len; n++) {
    const t = n / SR;
    let env = Math.min(1, t / attack);
    if (decay) env *= Math.exp(-t * decay);
    if (t > dur) env *= Math.max(0, 1 - (t - dur) / release);
    let s = 0;
    for (let k = 1; k <= harmonics; k++) {
      if (k * freq > SR / 2.2) break;
      s += Math.sin(2 * Math.PI * k * freq * t) / k;
    }
    const c = cutoff + (cutoffEnd - cutoff) * Math.min(1, t / (dur + release));
    lp += lpCoef(c) * (s - lp);
    write(synthL, synthR, start + n, lp * env * gain, pan, sendAmt);
  }
}

function kick(t0, gain = 0.75) {
  const start = Math.round(t0 * SR);
  let ph = 0;
  for (let n = 0; n < 0.45 * SR; n++) {
    const t = n / SR;
    ph += (2 * Math.PI * (44 + 120 * Math.exp(-t * 32))) / SR;
    const click = t < 0.004 ? noise() * 0.3 : 0;
    write(drumL, drumR, start + n, (Math.sin(ph) * Math.exp(-t * 7) + click) * gain, 0, 0);
    const d = 1 - 0.55 * Math.exp(-t * 9);
    if (start + n < N) duck[start + n] = Math.min(duck[start + n], d);
  }
}

function hat(t0, gain = 0.08, dec = 45, pan = 0.25) {
  const start = Math.round(t0 * SR);
  let lp = 0;
  const a = lpCoef(7000);
  for (let n = 0; n < Math.min(3, 6 / dec) * SR; n++) {
    const x = noise();
    lp += a * (x - lp);
    write(drumL, drumR, start + n, (x - lp) * Math.exp((-n / SR) * dec) * gain, pan, 0.05);
  }
}

function clap(t0, gain = 0.32) {
  const start = Math.round(t0 * SR);
  let lo = 0;
  let hi = 0;
  const aLo = lpCoef(800);
  const aHi = lpCoef(2600);
  for (let n = 0; n < 0.3 * SR; n++) {
    const t = n / SR;
    const x = noise();
    lo += aLo * (x - lo);
    hi += aHi * (x - hi);
    const bursts = t < 0.03 ? 0.6 + 0.4 * Math.sin(t * 2 * Math.PI * 100) : 1;
    write(drumL, drumR, start + n, (hi - lo) * Math.exp(-t * 16) * bursts * gain * 2.2, -0.1, 0.25);
  }
}

function tick(t0, gain = 0.05) {
  tone(t0, 0.02, 2093, { gain, decay: 90, release: 0.02, pan: 0.4, send: 0.2 });
}

function riser(t0, dur, gain = 0.25) {
  const start = Math.round(t0 * SR);
  let lp = 0;
  for (let n = 0; n < dur * SR; n++) {
    const p = n / (dur * SR);
    lp += lpCoef(200 * 40 ** p) * (noise() - lp);
    write(synthL, synthR, start + n, lp * p * p * gain * 3, Math.sin(p * 9) * 0.4, 0.4);
  }
}

function impact(t0, gain = 0.6) {
  const start = Math.round(t0 * SR);
  let ph = 0;
  let lp = 0;
  for (let n = 0; n < 2.5 * SR; n++) {
    const t = n / SR;
    ph += (2 * Math.PI * (36 + 30 * Math.exp(-t * 6))) / SR;
    lp += lpCoef(1800 * Math.exp(-t * 3) + 100) * (noise() - lp);
    const v = Math.sin(ph) * Math.exp(-t * 2.2) * gain + lp * Math.exp(-t * 4) * gain * 0.8;
    write(drumL, drumR, start + n, v, 0, 0.5);
  }
}

// --- Arrangement ---
const AM = [57, 60, 64];
const F = [53, 57, 60];
const C = [55, 60, 64];
const G = [55, 59, 62];
const PROG = [AM, F, C, G];
const ROOTS = [33, 29, 36, 31];
const bt = (b) => b * BAR;

// Bars 0-3 (problem): low pulse, clock ticks, a nagging high note, riser into the reveal.
for (let b = 0; b < 4; b++) {
  for (let e = 0; e < 8; e++) {
    const t = bt(b) + e * (BEAT / 2);
    if (t >= 7.75) continue;
    tone(t, 0.16, hz(33), { harmonics: 10, cutoff: 160 + b * 110, gain: 0.13 + b * 0.03, release: 0.05 });
    tone(t, 0.16, hz(33), { gain: 0.07 + b * 0.015, release: 0.05 });
  }
  for (let q = 0; q < 4; q++) {
    tick(bt(b) + q * BEAT, b === 0 ? 0.03 : 0.05);
    if (b >= 1) hat(bt(b) + q * BEAT + BEAT / 2, 0.035);
  }
  const nag = b >= 2 ? [76, 77] : [76];
  for (const m of nag) {
    tone(bt(b) + BEAT * 1.5, 0.1, hz(m), { harmonics: 4, decay: 7, gain: 0.05, pan: -0.3, send: 0.5, release: 0.3 });
  }
}
riser(5.5, 2.5);
impact(8);

// Bars 4-17: pads on Am F C G.
for (let b = 4; b < 18; b++) {
  const chord = PROG[(b - 4) % 4];
  for (const m of chord) {
    for (const [det, pan] of [[0.996, -0.55], [1.004, 0.55]]) {
      tone(bt(b), BAR, hz(m) * det, {
        harmonics: 10, cutoff: b < 6 ? 700 : 1300, attack: b === 4 ? 0.9 : 0.25, release: 0.5,
        gain: 0.035, pan, send: 0.35,
      });
    }
  }
}

// Bass: sustained in bars 4-5, driving 8ths in bars 6-17.
for (let b = 4; b < 18; b++) {
  const root = ROOTS[(b - 4) % 4];
  if (b < 6) {
    tone(bt(b), BAR - 0.1, hz(root), { gain: 0.16, attack: 0.3, release: 0.3 });
    continue;
  }
  for (let e = 0; e < 8; e++) {
    const m = e === 7 ? root + 12 : root;
    tone(bt(b) + e * (BEAT / 2), 0.2, hz(m), { harmonics: 8, cutoff: 420, gain: 0.2, release: 0.04 });
    tone(bt(b) + e * (BEAT / 2), 0.2, hz(m), { gain: 0.1, release: 0.04 });
  }
}

// Arpeggio: 8ths in bar 5, 16ths from bar 6 with the filter opening through the search scene.
const ARP = [0, 1, 2, 3, 2, 1, 0, 2];
for (let b = 5; b < 18; b++) {
  const chord = PROG[(b - 4) % 4].map((m) => m + 12);
  const tones = [...chord, chord[0] + 12];
  const step = b === 5 ? BEAT / 2 : S16;
  const count = BAR / step;
  for (let i = 0; i < count; i++) {
    const t = bt(b) + i * step;
    const cutoff = b < 6 ? 900 : b < 9 ? 900 + ((t - 12) / 6) * 3600 : 4200;
    tone(t, step * 0.8, hz(tones[ARP[i % ARP.length]]), {
      harmonics: 7, cutoff, decay: 9, release: 0.08, gain: 0.07, pan: i % 2 ? 0.35 : -0.35, send: 0.3,
    });
  }
}

// Drums: four-on-the-floor from bar 6 (search) until 36 s; claps and 16th hats from results.
riser(11, 1, 0.12);
for (let b = 6; b < 18; b++) {
  for (let q = 0; q < 4; q++) {
    const t = bt(b) + q * BEAT;
    kick(t);
    if (b >= 9 && (q === 1 || q === 3)) clap(t);
    if (b < 9) hat(t + BEAT / 2, 0.07);
    else for (let s = 0; s < 4; s++) hat(t + s * S16, s === 2 ? 0.08 : 0.04);
  }
}
for (let s = 0; s < 8; s++) clap(17 + s * S16, 0.08 + s * 0.03); // fill into results
impact(32, 0.35);
hat(32, 0.12, 2.5, 0); // crash

// Bars 18-19 (outro): drums drop, G then a long C major add9 to finish.
for (const m of [55, 59, 62, 67]) tone(bt(18), BAR, hz(m), { harmonics: 10, cutoff: 1500, attack: 0.1, release: 0.4, gain: 0.04, send: 0.4 });
tone(bt(18), BAR, hz(31), { gain: 0.16, release: 0.3 });
for (const m of [48, 60, 64, 67, 74]) tone(bt(19), 1.6, hz(m), { harmonics: 10, cutoff: 1800, attack: 0.05, release: 1.2, gain: 0.04, send: 0.5 });
tone(bt(19), 1.6, hz(36), { gain: 0.18, release: 1.2 });
for (const [i, m] of [72, 76, 79, 84].entries()) {
  tone(bt(18) + i * BEAT, 0.3, hz(m), { harmonics: 6, decay: 4, gain: 0.06, release: 0.6, send: 0.6, pan: i % 2 ? 0.3 : -0.3 });
}
tone(bt(19), 0.5, hz(84), { harmonics: 5, decay: 2, gain: 0.07, release: 1.5, send: 0.7 });

// --- Reverb (small Freeverb-style network on the send bus) ---
function reverb(input, offset) {
  const out = new Float32Array(N);
  for (const d of [1557, 1617, 1491, 1422, 1277, 1356]) {
    const len = d + offset;
    const buf = new Float32Array(len);
    let idx = 0;
    let damp = 0;
    for (let n = 0; n < N; n++) {
      const y = buf[idx];
      damp = y * 0.75 + damp * 0.25;
      buf[idx] = input[n] * 0.02 + damp * 0.86;
      idx = (idx + 1) % len;
      out[n] += y;
    }
  }
  for (const d of [556, 441, 341]) {
    const len = d + offset;
    const buf = new Float32Array(len);
    let idx = 0;
    for (let n = 0; n < N; n++) {
      const b = buf[idx];
      const x = out[n];
      out[n] = -x + b;
      buf[idx] = x + b * 0.5;
      idx = (idx + 1) % len;
    }
  }
  return out;
}
const revL = reverb(send, 0);
const revR = reverb(send, 23);

// --- Mix, soft clip, normalize, fade out ---
const master = [new Float32Array(N), new Float32Array(N)];
let peak = 0;
for (let n = 0; n < N; n++) {
  const t = n / SR;
  const fade = Math.min(1, t / 0.02) * (t > 38.4 ? Math.max(0, (40 - t) / 1.6) : 1);
  for (const [ch, s, d, r] of [[0, synthL, drumL, revL], [1, synthR, drumR, revR]]) {
    const v = Math.tanh((s[n] * duck[n] + d[n] + r[n] * 1.6) * 1.1) * fade;
    master[ch][n] = v;
    peak = Math.max(peak, Math.abs(v));
  }
}
const norm = 0.89 / peak;

const data = Buffer.alloc(44 + N * 4);
data.write("RIFF", 0);
data.writeUInt32LE(36 + N * 4, 4);
data.write("WAVE", 8);
data.write("fmt ", 12);
data.writeUInt32LE(16, 16);
data.writeUInt16LE(1, 20);
data.writeUInt16LE(2, 22);
data.writeUInt32LE(SR, 24);
data.writeUInt32LE(SR * 4, 28);
data.writeUInt16LE(4, 32);
data.writeUInt16LE(16, 34);
data.write("data", 36);
data.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  data.writeInt16LE(Math.round(master[0][n] * norm * 32767), 44 + n * 4);
  data.writeInt16LE(Math.round(master[1][n] * norm * 32767), 46 + n * 4);
}
mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
writeFileSync(new URL("../public/music.wav", import.meta.url), data);
console.log(`wrote public/music.wav (${DUR}s, peak ${peak.toFixed(2)} before normalize)`);
