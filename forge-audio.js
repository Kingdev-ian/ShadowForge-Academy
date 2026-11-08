/**
 * FORGE AUDIO ENGINE — ShadowForge Academy / MindForge Act I
 * -------------------------------------------------------------------------
 * A procedural Web Audio synthesizer. Zero audio files, zero network
 * requests, zero decode latency: every sound is generated the instant it is
 * called (0ms perceived latency). The first call happens inside a user
 * gesture (keypad press / blade click), so the AudioContext starts running
 * immediately.
 *
 * SINGLE SOURCE OF TRUTH
 * The class body is authored once, in index.html's
 * <script id="citadel-audio-src"> block, and reused here — so the legacy
 * in-document engine and this module can never drift apart. If that block is
 * unavailable (e.g. this module is bundled standalone), we fall back to the
 * copy below.
 */

/* eslint-disable no-new-func */

export const AUDIO_SRC_ELEMENT_ID = "citadel-audio-src";

// Fallback authoring of the same surface, used only when running outside the
// Citadel document (unit tests, standalone bundles, SSR).
const FALLBACK_SRC = `{
  constructor() { this.ctx = null; this.master = null; }
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }
  tone(type, from, to, dur, peak, delay) {
    const ctx = this.init();
    if (!ctx) return;
    const t0 = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t0 + dur);
    gain.gain.setValueAtTime(peak, t0);
    gain.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master || ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  noise(dur, peak, filterType, freqFrom, freqTo, delay) {
    const ctx = this.init();
    if (!ctx) return;
    const t0 = ctx.currentTime + (delay || 0);
    const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType || 'bandpass';
    filter.frequency.setValueAtTime(freqFrom, t0);
    filter.frequency.exponentialRampToValueAtTime(Math.max(freqTo, 20), t0 + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(peak, t0);
    gain.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master || ctx.destination);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }
  playPneumatic() {
    this.tone('sawtooth', 130, 30, 0.45, 0.3);
    this.noise(0.7, 0.16, 'highpass', 1800, 400, 0.02);
    this.tone('square', 62, 26, 0.35, 0.1, 0.04);
  }
  playSlice() {
    this.tone('triangle', 1400, 160, 0.2, 0.25);
    this.noise(0.22, 0.1, 'highpass', 5200, 1400, 0);
    this.tone('sine', 420, 90, 0.3, 0.12, 0.05);
  }
  playClick() {
    this.tone('sine', 900, 900, 0.04, 0.06);
  }
  playAlarm() {
    this.tone('square', 100, 100, 0.25, 0.2);
    this.tone('square', 74, 74, 0.28, 0.16, 0.14);
  }
  playSpark() {
    this.tone('sine', 2400, 520, 0.22, 0.07);
    this.noise(0.18, 0.05, 'bandpass', 3200, 900, 0);
  }
  playWeld() {
    this.tone('sine', 196, 196, 1.1, 0.16);
    this.tone('sine', 294, 294, 0.9, 0.1, 0.03);
    this.tone('triangle', 587, 587, 0.6, 0.05, 0.06);
    this.noise(0.5, 0.06, 'bandpass', 2400, 600, 0);
  }
  playSeal() {
    this.noise(0.55, 0.14, 'lowpass', 900, 120, 0);
    this.tone('sawtooth', 90, 18, 0.6, 0.18, 0.02);
  }
  playLockout() {
    this.tone('square', 220, 200, 0.18, 0.14);
    this.tone('square', 110, 100, 0.55, 0.18, 0.2);
    this.noise(0.9, 0.07, 'lowpass', 600, 80, 0.1);
  }
  playSurge() {
    this.tone('sawtooth', 180, 28, 0.9, 0.28);
    this.tone('square', 58, 22, 1.2, 0.16, 0.06);
    this.noise(1.0, 0.14, 'lowpass', 1200, 90, 0);
  }
  playFuse() {
    this.tone('sine', 147, 196, 0.9, 0.16);
    this.tone('triangle', 392, 392, 0.7, 0.07, 0.04);
    this.noise(0.7, 0.08, 'bandpass', 2800, 700, 0);
    this.playSpark();
  }
  stopAll() {}
}`;

function readSharedSource() {
  if (typeof document === "undefined") return null;
  const node = document.getElementById(AUDIO_SRC_ELEMENT_ID);
  const text = node && node.textContent ? node.textContent.trim() : "";
  return text.length > 40 ? text : null;
}

/**
 * ForgeAudio — thin class assembly over the shared synthesized body.
 * Methods: init, tone, noise, playPneumatic, playSlice, playClick, playAlarm,
 * playSpark, playWeld, playSeal, playLockout, playSurge, playFuse, stopAll.
 */
export class ForgeAudio {
  constructor() {
    /** Set by <MindForgeActOne muted /> — silences every call site. */
    this.muted = false;

    const body = readSharedSource() || FALLBACK_SRC;
    let members = {};
    try {
      // The body is a comma-terminated object literal of class members.
      members = new Function(`"use strict"; return ({${body}});`)();
    } catch (err) {
      // Corrupt embed -> fall back so audio never becomes a hard failure.
      console.warn("[ForgeAudio] shared synth source unreadable, using fallback.", err);
      members = new Function(`"use strict"; return ({${FALLBACK_SRC}});`)();
    }

    Object.keys(members).forEach((key) => {
      // `constructor` is the prototype hook, not a cue — never copy it across.
      if (key === "constructor" || typeof members[key] !== "function") return;
      Object.defineProperty(this, key, {
        value: members[key].bind(this),
        writable: true,
        configurable: true,
        enumerable: false
      });
    });
  }

  /** Guard wrapper: call an audio cue only when audio is allowed. */
  cue(name, ...args) {
    if (this.muted) return;
    const fn = this[name];
    if (typeof fn === "function") fn.apply(this, args);
  }
}

// Singleton — mirrors `const audio = new WebAudioSynth()` in index.html.
export const forgeAudio = new ForgeAudio();

export default forgeAudio;
