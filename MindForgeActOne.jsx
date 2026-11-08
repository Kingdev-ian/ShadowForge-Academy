import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import forgeAudio from "../lib/forge-audio.js";

/* ==========================================================================
   MINDFORGE // SECTOR 01 — ACT I: THE FRACTURED LIMIT
   --------------------------------------------------------------------------
   An in-world simulation, not a quiz. Two gates stand between the apprentice
   and the skybridge deck:

     PHASE 0 · AIR-LOCK DIAGNOSTIC   — direct substitution of the fractured
                                       rational function must be entered on a
                                       tactile numeric terminal to unbolt the
                                       pneumatic hatch.
     PHASE 1 · TRIAL 01             — three sequential gates, each one a real
                                       structural act. Nothing is handed over:

       1. IDENTIFY   the apprentice reads the fracture algebra off the
                     scratchpad and names the cancelling root themselves.
       2. SEVER      an interactive cyan cutting line must be physically
                     dragged across the singularity hole to slice that root.
       3. MEASURE    the reduced linear deck height is worked out ON PAPER and
                     punched into the mechanical tumbler ("4.0000").
       4. AFTERSHOCK a sudden 15-second surge tears girder three: its own line
                     must be crunched on paper and dialled in ("5.0000") before
                     the clock snaps the span.

   There is deliberately NO convenience button that factors the numerator or
   executes the sever: the old "free click" walkover is gone.

   Three curated seed variants (x→2, x→3, x→-2) rotate on every reset, so the
   node cannot be memorised: the strike-3 Archivist Lockout always hands back a
   *different* variant. Variant gamma cancels (x + 2) — not (x - 2) — and its
   aftershock line is chosen so that no answer can be recycled from memory.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CURATED SEED VARIANTS
   Every seed is the same canonical factorization with different parameters:
     f(x) = a(x² - h²) / b(x - h)  →  f(x) = (a/b)(x + h)
   so the cancelled (x - h) factor and the reduced line never coincide.
   -------------------------------------------------------------------------- */

export const SEED_VARIANTS = [
  {
    id: "limit-x2",
    label: "VARIANT ALPHA",
    approach: 2,
    approachLabel: "x → 2",
    numeratorTerms: ["x²", "- 4"],
    denominatorTerms: ["x", "- 2"],
    cancelledTerm: "x - 2",
    reducedNumerator: "x + 2",
    reducedDenominator: "1",
    deckLine: "x + 2",
    paperWork: "2 + 2",
    targetHeight: 4,
    fractureOffset: 0,
    shardSeed: 11,
    /* Aftershock surge on girder three — crunch y = 2x + 1 at x = 2. */
    aftershockLine: "2x + 1",
    aftershockPaper: "2(2) + 1",
    aftershockTarget: 5
  },
  {
    id: "limit-x3",
    label: "VARIANT BETA",
    approach: 3,
    approachLabel: "x → 3",
    numeratorTerms: ["2x²", "- 18"],
    denominatorTerms: ["2x", "- 6"],
    cancelledTerm: "x - 3",
    reducedNumerator: "x + 3",
    reducedDenominator: "1",
    deckLine: "x + 3",
    paperWork: "3 + 3",
    targetHeight: 6,
    fractureOffset: 1,
    shardSeed: 23,
    /* Aftershock: y = 3x - 2 at x = 3. */
    aftershockLine: "3x - 2",
    aftershockPaper: "3(3) - 2",
    aftershockTarget: 7
  },
  {
    id: "limit-neg2",
    label: "VARIANT GAMMA",
    approach: -2,
    approachLabel: "x → -2",
    numeratorTerms: ["x²", "- 4"],
    denominatorTerms: ["x", "+ 2"],
    cancelledTerm: "x + 2",
    reducedNumerator: "x - 2",
    reducedDenominator: "1",
    deckLine: "x - 2",
    paperWork: "-2 - 2",
    targetHeight: -4,
    fractureOffset: -1,
    shardSeed: 37,
    /* Aftershock: y = 2x + 5 at x = -2 → 1.0000. Deliberately NOT the primary
       height: a student who pattern-matches instead of crunching a new line
       gets caught by the tumbler. */
    aftershockLine: "2x + 5",
    aftershockPaper: "2(-2) + 5",
    aftershockTarget: 1
  }
];

/* Fixed-point format used by the mechanical height tumbler: 4 decimals. */
const HEIGHT_DECIMALS = 4;

export function formatHeight(value) {
  const abs = Math.abs(value).toFixed(HEIGHT_DECIMALS);
  return value < 0 ? `-${abs}` : abs;
}

/* Numeric readout for the air-lock keypad. All curated seeds collapse to 0/0,
   but the helper keeps the terminal honest rather than hard-coding "0/0". */
export function expectedDiagnostic() {
  return "0/0";
}

/* Tolerance mirrored by the tumbler and the instrument footer. */
const HEIGHT_TOLERANCE = 0.00005;

/* The aftershock surge clock. Fifteen seconds of grace, then the girder shears. */
export const AFTERSHOCK_SECONDS = 15;

/* Fraction of the cut-track the cyan beam must traverse to commit a sever. */
const SEVER_COMMIT_RATIO = 0.9;

/* The sagittal offset of the fracture hole from the deck's mid-axis, used so
   the instrument-space cut beam can be lined up with the canvas singularity. */
const FRACTURE_TRACK_PERCENT = 50;

/* Tensile shear readout. It climbs with every strike, peaks during the
   aftershock surge, and collapses when the span is finally fused. */
export function shearReadout({ strikes = 0, aftershock = false, welded = false }) {
  if (welded) return 0.06;
  if (aftershock) return 1.04;
  return Math.min(0.94, 0.42 + strikes * 0.19);
}

/* Utility: does a fixed-point input land on the expected height? */
export function heightMatches(input, expected) {
  if (typeof input !== "string" || input.trim() === "") return false;
  const parsed = Number.parseFloat(input);
  return Number.isFinite(parsed) && Math.abs(parsed - expected) < HEIGHT_TOLERANCE;
}


/* --------------------------------------------------------------------------
   2. SAGE DIALOGUE + STRIKE ESCALATION
   Sage is reactive: every gate has a cold briefing line, every mistake has a
   sarcastic retort, every escalation is sharper than the last, and victory is
   acknowledged without warmth.
   -------------------------------------------------------------------------- */

export const SAGE_STRIKES = [
  {
    id: 1,
    quote: "That wasn't a calculation. That was a prayer. Factor it.",
    tag: "STRIKE 01 // SHEAR INCREASE"
  },
  {
    id: 2,
    quote: "Fascinating. A limit that violates basic arithmetic. Did you close your eyes?",
    tag: "STRIKE 02 // STRUCTURAL VIOLATION"
  },
  {
    id: 3,
    quote: "Do not guess again.",
    tag: "STRIKE 03 // ARCHIVIST LOCKOUT"
  }
];

/* Named beats so every call site speaks with one voice.
   `variant` lets a line reference the live seed without string soup. */
export const SAGE_LINES = {
  hold: {
    tag: "SAGE // STANDING BY",
    quote:
      "Your pen is not decoration, apprentice. This deck is arithmetic wearing a coat of paint."
  },
  severLocked: {
    tag: "GATE 01 // IDENTIFY THE ROOT",
    quote:
      "Nothing moves until you name the root. Find the factor that cancels — do not swing at the whole numerator and call it work."
  },
  wrongRoot: {
    tag: "GATE 01 // HOLLOW STRIKE",
    quote:
      "That root does not vanish, so it does not get cut. Look at what the denominator kills. This is the third time I have said it: read it. It is written down. Correctly."
  },
  severArmed: {
    tag: "GATE 02 // BLADE ARMED",
    quote:
      "Good. You have found the hole. Now drag the cutting line across it — holding still does not sever anything."
  },
  severed: {
    tag: "GATE 02 // SINGULARITY CUT",
    quote:
      "Clean enough. The fracture is gone and the deck lies flat. That is not an answer — that is a shape. Now measure it on paper."
  },
  measureLocked: {
    tag: "GATE 03 // EVALUATE THE DECK",
    quote:
      "The root is severed. Do not trust your head; trust the paper. Work the reduced line at that boundary, then punch four places."
  },
  wrongHeight: {
    tag: "GATE 03 // HEIGHT REFUSED",
    quote:
      "The tumbler refused you. I could tell you why, but then you would learn nothing and I would lose a hobby. Show your working."
  },
  surge: {
    tag: "AFTERSHOCK // 15 SECOND CLOCK",
    quote:
      "That was almost competent. Almost is a synonym for 'not yet'. Load transfer just tore girder three — crunch its line and dial it, now."
  },
  surgeTimeout: {
    tag: "AFTERSHOCK // PIN MISSED",
    quote:
      "And the clock found you before the answer did. Fascinating. Re-seed and try to be faster than arithmetic."
  },
  wrongPin: {
    tag: "AFTERSHOCK // PIN REFUSED",
    quote:
      "Wrong number, wrong pin, wobbling girder. There is a clock behind you. Look at it. Then look at your working."
  },
  victory: {
    tag: "TRIAL 01 // SPAN FUSED",
    quote:
      "The hole is welded, the surge is capped. You did not guess your way here — remember the shape of that."
  }
};

export const LOCKOUT_SECONDS = 30;

/* --------------------------------------------------------------------------
   3. KEYFRAMES (injected once; no external stylesheet dependency)
   -------------------------------------------------------------------------- */

const ACT_ONE_KEYFRAMES = `
  /* ---- SHR-1 · LIVING GLASS DEBRIS (zero-g slipstream) ------------------ */
  @keyframes mf-shard-float-a {
    0%   { transform: translate3d(0, 0, 0) rotate(0deg) skewX(0deg) scale(1); }
    25%  { transform: translate3d(9px, -14px, 0) rotate(6deg) skewX(2deg) scale(1.03); }
    50%  { transform: translate3d(-6px, -26px, 0) rotate(-5deg) skewX(-1.4deg) scale(0.98); }
    75%  { transform: translate3d(12px, -9px, 0) rotate(9deg) skewX(1deg) scale(1.04); }
    100% { transform: translate3d(0, 0, 0) rotate(0deg) skewX(0deg) scale(1); }
  }
  @keyframes mf-shard-float-b {
    0%   { transform: translate3d(0, 0, 0) rotate(0deg) skewY(0deg) scale(1); }
    33%  { transform: translate3d(-14px, 11px, 0) rotate(-11deg) skewY(-2deg) scale(0.96); }
    66%  { transform: translate3d(7px, -17px, 0) rotate(7deg) skewY(1.4deg) scale(1.05); }
    100% { transform: translate3d(0, 0, 0) rotate(0deg) skewY(0deg) scale(1); }
  }
  @keyframes mf-shard-spin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes mf-shard-tilt {
    0%, 100% { transform: rotate(-7deg) translateY(0); }
    50%      { transform: rotate(7deg) translateY(-5px); }
  }
  @keyframes mf-shard-twinkle {
    0%, 100% { opacity: 0.75; }
    50%      { opacity: 1; }
  }
  /* ---- SHR-2 · TERMINAL-VELOCITY PARTICLES ----------------------------- */
  @keyframes mf-particle-rise {
    0%   { transform: translate3d(0, 0, 0); opacity: 0; }
    56%  { transform: translate3d(3px, -42vh, 0); opacity: 0.95; }
    100% { transform: translate3d(-2px, -58vh, 0); opacity: 0; }
  }
  /* ---- DECK · STRUCTURAL VIBRATION ------------------------------------- */
  @keyframes mf-shear-shiver {
    0%, 100% { transform: translate3d(0, 0, 0); }
    8%  { transform: translate3d(-1.4px, 0.8px, 0); }
    17% { transform: translate3d(1.2px, -0.9px, 0); }
    26% { transform: translate3d(-1.1px, 1.2px, 0); }
    35% { transform: translate3d(1.6px, -0.7px, 0); }
    44% { transform: translate3d(-1.3px, 0.6px, 0); }
    58% { transform: translate3d(1.1px, 1.1px, 0); }
    71% { transform: translate3d(-0.9px, -1.2px, 0); }
    84% { transform: translate3d(1.2px, 0.7px, 0); }
  }
  @keyframes mf-shear-violence {
    0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
    9%  { transform: translate3d(-4px, 3px, 0) rotate(-0.28deg); }
    23% { transform: translate3d(5px, -4px, 0) rotate(0.34deg); }
    38% { transform: translate3d(-6px, 4px, 0) rotate(-0.42deg); }
    52% { transform: translate3d(4px, -3px, 0) rotate(0.26deg); }
    67% { transform: translate3d(-4px, 2px, 0) rotate(-0.18deg); }
    81% { transform: translate3d(3px, -1px, 0) rotate(0.12deg); }
  }
  @keyframes mf-vector-pulse {
    0%, 100% { opacity: 0.85; filter: drop-shadow(0 0 3px #00E5FF); }
    50%      { opacity: 0.35; filter: drop-shadow(0 0 10px rgba(0,229,255,0.85)); }
  }
  @keyframes mf-hole-breathe {
    0%, 100% { opacity: 0.55; transform: scale(1); }
    50%      { opacity: 1; transform: scale(1.07); }
  }
  @keyframes mf-term-disintegrate {
    0%   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    60%  { opacity: 0.5; transform: translateY(-6px) scale(1.06); filter: blur(2px); }
    100% { opacity: 0; transform: translateY(-18px) scale(0.86); filter: blur(6px); }
  }
  @keyframes mf-weld-flood {
    0%   { stroke-dashoffset: 240; opacity: 0.35; }
    60%  { opacity: 1; }
    100% { stroke-dashoffset: 0; opacity: 1; }
  }
  /* ---- GATE 02 · CYAN CUTTING BEAM ------------------------------------ */
  @keyframes mf-cut-armed {
    0%, 100% { opacity: 0.75; box-shadow: 0 0 6px rgba(0,229,255,0.7); }
    50%      { opacity: 1; box-shadow: 0 0 18px rgba(0,229,255,0.95); }
  }
  @keyframes mf-cut-surge {
    0%   { transform: scaleY(0.6); opacity: 0; }
    30%  { transform: scaleY(1.25); opacity: 1; }
    100% { transform: scaleY(1); opacity: 0.9; }
  }
  @keyframes mf-cut-ghost {
    0%   { opacity: 0.5; }
    50%  { opacity: 0.12; }
    100% { opacity: 0.5; }
  }
  /* ---- AFTERSHOCK · GIRDER THREE -------------------------------------- */
  @keyframes mf-aftershock-lamp {
    0%, 100% { opacity: 0.35; filter: drop-shadow(0 0 4px rgba(255,51,75,0.6)); }
    50%      { opacity: 1; filter: drop-shadow(0 0 16px rgba(255,51,75,0.95)); }
  }
  @keyframes mf-aftershock-drift {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50%      { transform: translate3d(0, -2.4px, 0); }
  }
  /* ---- AMBIENT / SHELL ------------------------------------------------- */
  @keyframes mf-grid-recede {
    0%   { opacity: 0.22; }
    50%  { opacity: 0.34; }
    100% { opacity: 0.22; }
  }
  @keyframes mf-amber-bloom {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes mf-veil-in {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes mf-scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(1400%); }
  }
  @keyframes mf-sage-speak {
    0%   { opacity: 0; transform: translateY(6px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes mf-rise-in {
    0%   { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .mf-anim { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; }
  }
`;


/* --------------------------------------------------------------------------
   4. AUDIO BRIDGE
   Every cue funnels through one guard so <MindForgeActOne muted /> silences
   the whole node without touching each call site.
   -------------------------------------------------------------------------- */

function useAudioBridge(muted) {
  useEffect(() => {
    forgeAudio.muted = !!muted;
    return () => {
      forgeAudio.muted = false;
    };
  }, [muted]);


/* --------------------------------------------------------------------------
   5. LIVING SKYBRIDGE SCENERY — PARTICLES + GLASS DEBRIS
   Both fields are deterministic per-seed, so a lockout re-seed restages the
   void without any per-frame random flicker.
   -------------------------------------------------------------------------- */

function seededRandom(seed) {
  let n = (seed * 9301 + 49297) % 233280;
  return () => {
    n = (n * 9301 + 49297) % 233280;
    return n / 233280;
  };
}

/* Micro-particles drifting UPWARD against the terminal-velocity freefall wind.
   The keyframe brakes each particle as it ages, so they accelerate and then
   settle into a slow, weightless cruise — reading as air moving past falling
   glass rather than a screensaver. */
function buildParticles(seed, count = 34) {
  const rand = seededRandom(seed + 7);
  return Array.from({ length: count }, (_, i) => {
    const depth = i % 3; // 0 = far, 2 = near
    return {
      key: `particle-${seed}-${i}`,
      x: rand() * 100,
      y: 30 + rand() * 80,
      size: depth === 2 ? 2.2 : depth === 1 ? 1.5 : 1,
      cyan: rand() > 0.62,
      depth,
      dur: 9 + rand() * 16,
      delay: -rand() * 20
    };
  });
}

function ParticleField({ seed }) {
  const particles = useMemo(() => buildParticles(seed), [seed]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.key}
          className="absolute mf-anim rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.cyan ? "#00E5FF" : "#E8E6E1",
            opacity: 0.1 + p.depth * 0.14,
            animation: `mf-particle-rise ${p.dur}s linear ${p.delay}s infinite`,
            willChange: "transform, opacity"
          }}
        />
      ))}
    </div>
  );
}

/* Living glass debris: slow asynchronous float, tilt and spin. */
function buildShards(seed) {
  const rand = seededRandom(seed);
  return Array.from({ length: 20 }, (_, i) => {
    const depth = i % 3; // 0 = far, 2 = near -> drives parallax, blur, opacity
    const size = 9 + rand() * (depth === 2 ? 52 : 26);
    return {
      key: `shard-${seed}-${i}`,
      x: rand() * 100,
      y: 4 + rand() * 84,
      size,
      rotation: rand() * 360,
      depth,
      floatDur: 15 + rand() * 16,
      floatDelay: -rand() * 14,
      spinDur: 42 + rand() * 46,
      spinDelay: -rand() * 30,
      tiltDur: 7 + rand() * 9,
      tiltDelay: -rand() * 8,
      float: depth % 2 === 0 ? "mf-shard-float-a" : "mf-shard-float-b",
      hot: depth === 2 && rand() > 0.66
    };
  });
}

function ShardField({ seed }) {
  const shards = useMemo(() => buildShards(seed), [seed]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {shards.map((s) => (
        <div
          key={s.key}
          className="absolute mf-anim"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size * 1.34,
            opacity: 0.16 + s.depth * 0.12,
            animation: `${s.float} ${s.floatDur}s ease-in-out ${s.floatDelay}s infinite`,
            filter: `blur(${(2 - s.depth) * 0.7}px)`,
            willChange: "transform, opacity"
          }}
        >
          {/* Outer shell: slow spin + asynchronous tilt (each layer owns its
              own transform channel so float, tilt and spin never fight). */}
          <div
            className="h-full w-full mf-anim"
            style={{
              animation: `mf-shard-spin ${s.spinDur}s linear ${s.spinDelay}s infinite`
            }}
          >
            <div
              className="h-full w-full mf-anim"
              style={{
                animation: `mf-shard-tilt ${s.tiltDur}s ease-in-out ${s.tiltDelay}s infinite`,
                transform: `rotate(${s.rotation}deg)`
              }}
            >
              <div
                className={s.hot ? "h-full w-full mf-anim" : "h-full w-full"}
                style={{
                  background: s.hot
                    ? "linear-gradient(135deg, rgba(255,200,87,0.22) 0%, rgba(232,230,225,0.12) 45%, rgba(7,9,14,0) 100%)"
                    : "linear-gradient(135deg, rgba(232,230,225,0.16) 0%, rgba(0,229,255,0.10) 45%, rgba(7,9,14,0) 100%)",
                  border: `1px solid ${s.hot ? "rgba(255,200,87,0.28)" : "rgba(232,230,225,0.10)"}`,
                  clipPath: "polygon(12% 0%, 100% 18%, 84% 100%, 0% 74%)",
                  animation: s.hot ? `mf-shard-twinkle ${4 + s.tiltDur}s ease-in-out infinite` : "none"
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


/* --------------------------------------------------------------------------
   6. THE LIVING SKYBRIDGE — layered canvas over the obsidian void
   Three stacked layers, each owning one transform channel so nothing fights:

     L1  deep wireframe grid receding to the vanishing point (never shakes)
     L2  structural truss + deck: SHIVERS when tensile shear exceeds 0.70 kN
     L3  instrument plane: fracture hole, ticks, overlays (crisp, always legible)
   Living scenery (upward particles + rotating glass debris) drifts above.
   -------------------------------------------------------------------------- */

function SkybridgeCanvas({ seed, severed, welded, aftershock, shear, flash }) {
  const fractureX = 500 + seed.fractureOffset * 120;

  // Tensile shear above 0.70 kN physically shivers the structure; during the
  // aftershock surge it escalates to a violent shudder.
  const shivering = shear > 0.7;
  const structureAnimation = aftershock
    ? "mf-shear-violence 620ms linear infinite"
    : shivering
      ? "mf-shear-shiver 300ms linear infinite"
      : flash > 0
        ? "mf-shear-violence 520ms ease-in-out 2"
        : "none";

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Matte obsidian floor */}
      <div className="absolute inset-0 bg-[#07090E]" />

      {/* L1 — deep 3D wireframe receding into the centre void */}
      <PerspectiveGrid />

      {/* L2 — load-bearing structure (vibrates under shear) */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ animation: structureAnimation }}
      >
        <svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id="mf-deck" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0E131C" />
              <stop offset="55%" stopColor="#121722" />
              <stop offset="100%" stopColor="#0A0D14" />
            </linearGradient>
          </defs>
          <DeckStructure
            fractureX={fractureX}
            welded={welded}
            aftershock={aftershock}
            shear={shear}
          />
        </svg>
      </div>

      {/* L3 — instrument plane (crisp, unaffected by the shiver) */}
      <svg
        viewBox="0 0 1000 560"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="mf-hole-fade">
            <stop offset="0%" stopColor="#07090E" stopOpacity="1" />
            <stop offset="70%" stopColor="#07090E" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#07090E" stopOpacity="0.72" />
          </radialGradient>
          <linearGradient id="mf-weld-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFC857" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFC857" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFC857" stopOpacity="0" />
          </linearGradient>
        </defs>

        {!welded && <FractureHole fractureX={fractureX} aftershock={aftershock} />}
        <DeckTicks fractureX={fractureX} aftershock={aftershock} />
        {severed && !welded && <SeveredOverlay seed={seed} fractureX={fractureX} />}
        {welded && <WeldedOverlay seed={seed} fractureX={fractureX} />}
      </svg>

      {/* Living scenery drifting through the freefall slipstream */}
      <ParticleField seed={seed.shardSeed} />
      <ShardField seed={seed.shardSeed} />

      {/* Matte vignette keeps the instrument panel legible over the void. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_45%,transparent_0%,rgba(7,9,14,0.94)_100%)]" />
    </div>
  );
}

/* Vanishing point of the perspective grid (percentage of the canvas). */
const VANISHING_POINT = { x: 50, y: 58 };

/* A deep 3D wireframe receding into the centre void: rails converge on the
   vanishing point, transverse wires are perspective-spaced, and the core of
   the ellipse is swallowed by pure obsidian so the grid reads as depth. */
function PerspectiveGrid() {
  const vx = VANISHING_POINT.x * 10;
  const vy = VANISHING_POINT.y * 5.6;

  // Rails fan out from the void; the two central rails are the load axis.
  const rails = [-260, -170, -100, -46, -16, 16, 46, 100, 170, 260];

  // Each ring is scaled toward the vanishing point -> artificial perspective.
  const rings = [0.06, 0.13, 0.22, 0.33, 0.47, 0.64, 0.84, 1.08, 1.38];

  return (
    <svg
      viewBox="0 0 1000 560"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      style={{ animation: "mf-grid-recede 11s ease-in-out infinite" }}
    >
      <defs>
        <linearGradient id="mf-grid-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8E6E1" stopOpacity="0" />
          <stop offset="30%" stopColor="#E8E6E1" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#E8E6E1" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id="mf-void-core">
          <stop offset="0%" stopColor="#07090E" stopOpacity="1" />
          <stop offset="55%" stopColor="#07090E" stopOpacity="0.68" />
          <stop offset="100%" stopColor="#07090E" stopOpacity="0" />
        </radialGradient>
      </defs>

      {rails.map((offset, i) => (
        <line
          key={`rail-${i}`}
          x1={vx}
          y1={vy}
          x2={vx + offset * 6.4}
          y2="600"
          stroke="url(#mf-grid-fade)"
          strokeWidth={i === 4 || i === 5 ? 1 : 0.7}
          strokeOpacity={i === 4 || i === 5 ? 0.32 : 0.16}
        />
      ))}

      {rings.map((t, i) => {
        const y = vy + (600 - vy) * t;
        const halfWidth = 120 + 470 * t;
        return (
          <line
            key={`ring-${i}`}
            x1={vx - halfWidth}
            y1={y}
            x2={vx + halfWidth}
            y2={y}
            stroke="#E8E6E1"
            strokeWidth="1"
            strokeOpacity={0.05 + t * 0.13}
          />
        );
      })}

      <ellipse cx={vx} cy={vy} rx="270" ry="135" fill="url(#mf-void-core)" />
    </svg>
  );
}

/* Girder three's own linear line — the survivor that takes the aftershock. */
function DeckStructure({ fractureX, welded, aftershock, shear }) {
  const energy = welded ? "#FFC857" : "#00E5FF";
  const trussPoints = [90, 150, 210, 270, 330, 390, 450, 510, 570, 630, 690, 750, 810, 870, 930];

  return (
    <g>
      {/* Deck slab */}
      <rect
        x="30"
        y="232"
        width="940"
        height="96"
        fill="url(#mf-deck)"
        stroke="rgba(232,230,225,0.16)"
        strokeWidth="1"
      />

      {/* 1px razor limestone plate divisions */}
      {Array.from({ length: 17 }).map((_, i) => (
        <path
          key={`plate-${i}`}
          d={`M ${60 + i * 56} 232 L ${60 + i * 56} 328`}
          stroke="rgba(232,230,225,0.06)"
          strokeWidth="0.8"
        />
      ))}
      <path d="M 46 264 L 954 264" stroke="rgba(232,230,225,0.05)" strokeWidth="0.8" />

      {/* Upper chord */}
      <path d="M 30 232 L 970 232" stroke="#E8E6E1" strokeOpacity="0.28" strokeWidth="1" />

      {/* Active deck energy: electric cyan live, molten gold once fused */}
      <path
        d="M 30 240 L 970 240"
        stroke={energy}
        strokeWidth={welded ? 2.2 : 1.4}
        strokeOpacity={welded ? 0.95 : 0.55}
        style={{
          filter: welded
            ? "drop-shadow(0 0 10px rgba(255,200,87,0.85))"
            : "drop-shadow(0 0 8px rgba(0,229,255,0.6))"
        }}
      />

      {/* Truss framework — shivers with the shear load */}
      <path
        d={trussPoints
          .map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${i % 2 === 0 ? 328 : 232}`)
          .join(" ")}
        fill="none"
        stroke="#E8E6E1"
        strokeOpacity="0.22"
        strokeWidth="0.9"
      />
      <path
        d={trussPoints
          .map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${i % 2 === 0 ? 232 : 328}`)
          .join(" ")}
        fill="none"
        stroke="#00E5FF"
        strokeOpacity={welded ? 0.12 : 0.18}
        strokeWidth="0.8"
      />
      <path d="M 30 328 L 970 328" stroke="#E8E6E1" strokeOpacity="0.3" strokeWidth="1.2" />

      {/* Girder three: the survivor deck line that takes the aftershock */}
      <g>
        <path
          d={`M ${fractureX + 130} 356 L ${fractureX + 470} 356`}
          stroke="#E8E6E1"
          strokeOpacity="0.14"
          strokeWidth="0.9"
        />
        <path d={`M ${fractureX + 130} 328 L ${fractureX + 130} 372`} stroke="#E8E6E1" strokeOpacity="0.14" strokeWidth="0.9" />
        <path d={`M ${fractureX + 470} 328 L ${fractureX + 470} 372`} stroke="#E8E6E1" strokeOpacity="0.14" strokeWidth="0.9" />

        {aftershock && (
          <g className="mf-anim" style={{ animation: "mf-aftershock-lamp 620ms ease-in-out infinite" }}>
            <path d={`M ${fractureX + 130} 356 L ${fractureX + 470} 356`} stroke="#FF334B" strokeWidth="1.8" />
            <circle cx={fractureX + 300} cy="356" r="4" fill="#FF334B" />
            <path
              d={`M ${fractureX + 196} 322 L ${fractureX + 212} 338 L ${fractureX + 194} 348 L ${fractureX + 210} 366`}
              fill="none"
              stroke="#FF334B"
              strokeOpacity="0.85"
              strokeWidth="1.1"
            />
            <text
              x={fractureX + 300}
              y="384"
              textAnchor="middle"
              fill="#FF334B"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 8, letterSpacing: "0.18em" }}
            >
              GIRDER THREE // SURGE
            </text>
          </g>
        )}
      </g>

      {/* Live loadpath readout etched onto the deck */}
      <text
        x="46"
        y="252"
        fill="#00E5FF"
        fillOpacity="0.5"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 7.5, letterSpacing: "0.26em" }}
      >
        {welded ? "LOADPATH // FUSED" : shear > 0.7 ? "LOADPATH // RESONATING" : "LOADPATH // LIVE"}
      </text>
    </g>
  );
}

function FractureHole({ fractureX, aftershock }) {
  return (
    <g>
      <ellipse
        cx={fractureX}
        cy={280}
        rx={54}
        ry={44}
        fill="url(#mf-hole-fade)"
        stroke="#00E5FF"
        strokeWidth="1.2"
        strokeOpacity="0.7"
        className="mf-anim"
        style={{
          animation: "mf-hole-breathe 2.4s ease-in-out infinite",
          transformOrigin: `${fractureX}px 280px`
        }}
      />
      <path
        d={`M ${fractureX - 50} 236 L ${fractureX - 34} 258 L ${fractureX - 52} 274 L ${fractureX - 30} 298 L ${fractureX - 46} 328`}
        fill="none"
        stroke="#FF334B"
        strokeOpacity="0.75"
        strokeWidth="1.1"
      />
      <path
        d={`M ${fractureX + 50} 236 L ${fractureX + 32} 260 L ${fractureX + 54} 278 L ${fractureX + 28} 300 L ${fractureX + 48} 328`}
        fill="none"
        stroke="#FF334B"
        strokeOpacity="0.75"
        strokeWidth="1.1"
      />

      <g>
        {/* Pulsating cyan vectors through the hole */}
        <path
          d={`M ${fractureX - 120} 300 L ${fractureX} 285 L ${fractureX + 120} 268`}
          fill="none"
          stroke="#00E5FF"
          strokeWidth="1"
          strokeDasharray="6 5"
          className="mf-anim"
          style={{ animation: "mf-vector-pulse 1.8s ease-in-out infinite" }}
        />
        <path
          d={`M ${fractureX - 120} 262 L ${fractureX} 285 L ${fractureX + 120} 306`}
          fill="none"
          stroke="#00E5FF"
          strokeWidth="1"
          strokeDasharray="6 5"
          className="mf-anim"
          style={{ animation: "mf-vector-pulse 1.8s ease-in-out 0.45s infinite" }}
        />
        <path
          d={`M ${fractureX} 200 L ${fractureX} 360`}
          stroke="#00E5FF"
          strokeOpacity="0.35"
          strokeWidth="0.9"
          strokeDasharray="3 7"
        />
        <circle
          cx={fractureX}
          cy={280}
          r="3.4"
          fill="#00E5FF"
          className="mf-anim"
          style={{
            animation: "mf-vector-pulse 1.8s ease-in-out infinite",
            filter: "drop-shadow(0 0 8px #00E5FF)"
          }}
        />

        {/* The singularity the apprentice must name and then cut. */}
        <text
          x={fractureX}
          y={192}
          textAnchor="middle"
          fill={aftershock ? "#FF334B" : "#00E5FF"}
          fillOpacity="0.8"
          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, letterSpacing: "0.22em" }}
        >
          SINGULARITY
        </text>
      </g>
    </g>
  );
}

function DeckTicks({ fractureX, aftershock }) {
  return (
    <g>
      {[-2, -1, 0, 1, 2, 3, 4].map((tick) => (
        <g key={`tick-${tick}`}>
          <path
            d={`M ${500 + tick * 120} 328 L ${500 + tick * 120} 340`}
            stroke="rgba(232,230,225,0.28)"
            strokeWidth="0.9"
          />
          <text
            x={500 + tick * 120}
            y={354}
            textAnchor="middle"
            fill="rgba(232,230,225,0.34)"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}
          >
            {tick}
          </text>
        </g>
      ))}

      {/* Load readers under girder three only appear with the surge. */}
      {aftershock && (
        <>
          <path
            d={`M ${fractureX + 130} 396 L ${fractureX + 470} 396`}
            stroke="#FF334B"
            strokeOpacity="0.45"
            strokeWidth="0.9"
            strokeDasharray="2 6"
          />
          <circle cx={fractureX + 300} cy="396" r="2.2" fill="#FF334B" />
        </>
      )}
    </g>
  );
}

/* Severed state: the hole stays open, the reduced line is revealed. */
function SeveredOverlay({ seed, fractureX }) {
  return (
    <g>
      <path
        d={`M ${fractureX - 46} 260 L ${fractureX + 46} 260`}
        stroke="#E8E6E1"
        strokeOpacity="0.55"
        strokeWidth="1.4"
        strokeDasharray="7 6"
      />
      <text
        x={fractureX}
        y={214}
        textAnchor="middle"
        fill="#E8E6E1"
        fillOpacity="0.85"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 15, letterSpacing: "0.16em" }}
      >
        y = {seed.deckLine}
      </text>
      <text
        x={fractureX}
        y={364}
        textAnchor="middle"
        fill="#00E5FF"
        fillOpacity="0.75"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, letterSpacing: "0.18em" }}
      >
        ROOT CANCELLED — HEIGHT UNRESOLVED
      </text>
    </g>
  );
}

/* Welded state: permanent amber gold span. */
function WeldedOverlay({ seed, fractureX }) {
  return (
    <g style={{ animation: "mf-amber-bloom 900ms ease-out both" }}>
      <rect x="30" y="232" width="940" height="96" fill="rgba(255,200,87,0.07)" />
      <path d={`M 40 260 L ${fractureX - 46} 260`} stroke="#FFC857" strokeWidth="2.4" />
      <path d={`M ${fractureX + 46} 260 L 960 260`} stroke="#FFC857" strokeWidth="2.4" />
      <path
        d={`M ${fractureX - 46} 260 L ${fractureX + 46} 260`}
        stroke="#FFC857"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="240"
        className="mf-anim"
        style={{ animation: "mf-weld-flood 1.2s ease-out both" }}
      />
      <rect x={fractureX - 60} y="222" width="120" height="116" fill="url(#mf-weld-glow)" opacity="0.2" />
      <text
        x={fractureX}
        y={214}
        textAnchor="middle"
        fill="#FFC857"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 15, letterSpacing: "0.14em" }}
      >
        y = {seed.deckLine} // WELDED {formatHeight(seed.targetHeight)}
      </text>
    </g>
  );
}



/* --------------------------------------------------------------------------
   7. PHASE 0 — AIR-LOCK DIAGNOSTIC TERMINAL
   Tactile numeric keypad (0-9, /, -, CLR, COMMIT). The apprentice must enter
   the direct-substitution result "0/0" to unbolt the pneumatic hatch.
   -------------------------------------------------------------------------- */

const KEYPAD_LAYOUT = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "/", "-"];

function AirlockTerminal({ seed, value, releasing, onKey, onCommit, onClear }) {
  const ready = value === "0/0";

  return (
    <div className="w-full max-w-[420px] mx-auto">
      {/* Function plate */}
      <div className="relative border border-[#00E5FF]/35 bg-[#0A0C14]/90 px-5 py-5 text-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,229,255,0.5) 0 1px, transparent 1px 5px)"
          }}
        />
        <div className="mono text-[7px] tracking-[0.32em] text-[#00E5FF]/70 mb-3">
          BULKHEAD 09 // DIRECT SUBSTITUTION
        </div>
        <div className="font-serif text-[19px] md:text-[22px] text-[#E8E6E1] leading-tight">
          lim <span className="text-[13px] opacity-60">({seed.approachLabel})</span>
        </div>
        <div className="mono mt-2 text-[15px] md:text-[17px] text-[#E8E6E1]/90">
          <span className="inline-flex flex-col items-center align-middle mx-1">
            <span className="px-2">{seed.numeratorTerms.join(" ")}</span>
            <span className="w-full h-[1px] bg-[#E8E6E1]/50 my-[3px]" />
            <span className="px-2">{seed.denominatorTerms.join(" ")}</span>
          </span>
        </div>
        <div className="mono mt-4 text-[8px] tracking-[0.14em] text-[#FFC857]/85">
          f({seed.approach}) = ({seed.approach}² − {seed.approach * seed.approach}) / (
          {seed.approach} − {seed.approach}) =
          <span className="text-[#FF334B]"> ? / ?</span>
        </div>
      </div>

      {/* Register readout */}
      <div
        className={`mt-3 h-14 border bg-[#07090E] flex items-center justify-between px-4 transition-colors ${ready ? "border-[#FFC857]" : "border-[#00E5FF]/60"
          }`}
      >
        <span className="mono text-[7px] tracking-[0.24em] text-[#E8E6E1]/40">REGISTER</span>
        <span
          className={`mono text-[20px] font-bold tracking-[0.14em] ${ready ? "text-[#FFC857]" : "text-[#00E5FF]"
            }`}
          style={{ textShadow: ready ? "0 0 12px rgba(255,200,87,0.6)" : "0 0 10px rgba(0,229,255,0.45)" }}
        >
          {value || "— —"}
        </span>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-1.5 mt-2">
        {KEYPAD_LAYOUT.map((k) => (
          <button
            key={k}
            type="button"
            disabled={releasing}
            onClick={() => onKey(k)}
            className="h-12 md:h-14 border border-[#E8E6E1]/18 bg-[#0A0C14] mono text-[15px] text-[#E8E6E1]/85 hover:border-[#00E5FF]/80 hover:text-[#00E5FF] active:scale-[0.96] transition-all disabled:opacity-30"
          >
            {k}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1.5 mt-2">
        <button
          type="button"
          disabled={releasing}
          onClick={onClear}
          className="h-11 border border-[#E8E6E1]/18 mono text-[9px] tracking-[0.24em] text-[#E8E6E1]/55 hover:text-[#E8E6E1] hover:border-[#E8E6E1]/40 transition-all disabled:opacity-30"
        >
          CLR
        </button>
        <button
          type="button"
          disabled={releasing}
          onClick={onCommit}
          className="h-11 border border-[#FFC857] bg-[#FFC857]/10 mono text-[9px] tracking-[0.24em] font-bold text-[#FFC857] hover:bg-[#FFC857]/20 active:scale-[0.98] transition-all disabled:opacity-30"
        >
          COMMIT
        </button>
      </div>

      <div className="mono mt-3 text-center text-[7px] tracking-[0.2em] text-[#E8E6E1]/25">
        HATCH RELEASE REQUIRES THE INDETERMINATE FORM
      </div>
    </div>
  );

/* --------------------------------------------------------------------------
   8. PHASE 1 — TRIAL 01: GATES 01 + 02
   Gate 01 · the apprentice must NAME the cancelling root (no free factoring).
   Gate 02 · an interactive cyan cutting line must be dragged across the
             singularity hole. Holding still severs nothing.
   -------------------------------------------------------------------------- */

const ROOT_OPTIONS = ["x - 2", "x + 2", "x - 4", "x + 4"];

/* The four candidate roots for a seed, with the denominator's true root first
   in the pool so the list never looks suspiciously ordered. */
function rootOptionsFor(seed) {
  const shared = ROOT_OPTIONS.filter(
    (option) => option !== seed.cancelledTerm && option !== `x ${seed.approach > 0 ? "-" : "+"} ${Math.abs(seed.approach)}`
  );
  return [seed.cancelledTerm, ...shared.slice(0, 3)];
}

function RootIdentifier({ seed, rootPicked, onPick }) {
  const options = useMemo(() => rootOptionsFor(seed), [seed]);
  const locked = Boolean(rootPicked);

  return (
    <div className="border border-[#E8E6E1]/14 bg-[#0A0C14]/85 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="mono text-[7px] tracking-[0.26em] text-[#00E5FF]/70">
          GATE 01 // IDENTIFY THE CANCELLING ROOT
        </span>
        <span
          className="mono text-[7px] tracking-[0.22em]"
          style={{ color: locked ? "#FFC857" : "rgba(232,230,225,0.32)" }}
        >
          {locked ? "ROOT HELD" : "UNRESOLVED"}
        </span>
      </div>

      <p className="font-garamond italic mt-1.5 text-[12px] leading-snug text-[#E8E6E1]/60">
        Which factor appears in both the numerator and the denominator? Name it
        from memory — the deck will not factor anything for you.
      </p>

      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {options.map((option) => {
          const isHeld = rootPicked === option;
          return (
            <button
              key={option}
              type="button"
              disabled={locked}
              onClick={() => onPick(option)}
              className="h-10 border mono text-[11px] tracking-[0.1em] transition-all active:scale-[0.97] disabled:opacity-40"
              style={{
                borderColor: isHeld ? "#FFC857" : "rgba(232,230,225,0.18)",
                background: isHeld ? "rgba(255,200,87,0.1)" : "#07090E",
                color: isHeld ? "#FFC857" : "rgba(232,230,225,0.82)"
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {locked && (
        <div className="mono mt-2 text-[7px] tracking-[0.16em] text-[#FFC857]/80">
          ROOT LOCKED → DRAG THE CUTTING LINE ACROSS THE SINGULARITY
        </div>
      )}
    </div>
  );
}

/* GATE 02 · the interactive cyan cutting line.
   Armed only once the root is named. The apprentice must drag the beam from
   one side of the singularity hole to the other; releasing short of the far
   edge snaps it back. There is no button that does this for them. */
function CutLine({ seed, armed, severed, onSever, onMiss, progress }) {
  const trackRef = useRef(null);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [x, setX] = useState(FRACTURE_TRACK_PERCENT - 34);

  const ratioFromEvent = (event) => {
    const node = trackRef.current;
    if (!node) return null;
    const box = node.getBoundingClientRect();
    const clientX =
      event.touches && event.touches[0] ? event.touches[0].clientX : event.clientX;
    if (typeof clientX !== "number") return null;
    return Math.min(100, Math.max(0, ((clientX - box.left) / box.width) * 100));
  };

  const reset = () => {
    draggingRef.current = false;
    setDragging(false);
    progress.current = 0;
    setX(FRACTURE_TRACK_PERCENT - 34);
  };

  const handlePointerDown = (event) => {
    if (!armed || severed) return;
    draggingRef.current = true;
    setDragging(true);
    progress.current = 0;
    const ratio = ratioFromEvent(event);
    if (ratio !== null) setX(ratio);
  };

  const handlePointerMove = (event) => {
    if (!draggingRef.current || severed) return;
    const ratio = ratioFromEvent(event);
    if (ratio === null) return;
    setX(ratio);
    progress.current = Math.max(progress.current, ratio - FRACTURE_TRACK_PERCENT);
    // A full pass past the far edge of the hole commits the sever.
    if (ratio >= FRACTURE_TRACK_PERCENT + 30) {
      reset();
      onSever();
    }
  };

  const handlePointerUp = () => {
    if (!draggingRef.current) return;
    const travelled = progress.current;
    reset();
    // Dragged, but never reached the far side of the hole: the deck holds.
    if (travelled > 4) onMiss();
  };

  const beamVisible = armed || severed;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <span className="mono text-[7px] tracking-[0.26em] text-[#00E5FF]/70">
          GATE 02 // MONOMOLECULAR CUTTING LINE
        </span>
        <span className="mono text-[7px] tracking-[0.22em] text-[#E8E6E1]/30">
          {severed ? "SEVER COMMITTED" : armed ? "ARMED" : "LOCKED — NAME THE ROOT"}
        </span>
      </div>

      <div
        ref={trackRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        className="relative mt-2 h-[104px] border bg-[#07090E]/85 overflow-hidden select-none"
        style={{
          touchAction: "none",
          borderColor: severed
            ? "rgba(255,200,87,0.45)"
            : armed
              ? "rgba(0,229,255,0.45)"
              : "rgba(232,230,225,0.12)",
          cursor: armed && !severed ? "crosshair" : "default"
        }}
      >
        {/* Guide rail */}
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[#E8E6E1]/12" />

        {/* The singularity hole: the cut must pass through it. */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full"
          style={{
            left: `${FRACTURE_TRACK_PERCENT}%`,
            width: 62,
            height: 58,
            border: `1px solid ${severed ? "rgba(255,200,87,0.35)" : "rgba(0,229,255,0.5)"}`,
            background: "radial-gradient(circle at 50% 50%, #07090E 60%, rgba(0,229,255,0.07) 100%)",
            animation: severed ? "none" : "mf-hole-breathe 2.4s ease-in-out infinite"
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 mono text-[7px] tracking-[0.14em]"
          style={{
            left: `${FRACTURE_TRACK_PERCENT}%`,
            color: severed ? "rgba(255,200,87,0.85)" : "rgba(0,229,255,0.75)"
          }}
        >
          {severed ? "CUT" : (seed.cancelledTerm || "").toUpperCase()}
        </div>

        {/* Ghost of the armed beam waiting for a drag. */}
        {armed && !severed && !dragging && (
          <div
            className="absolute top-[12%] bottom-[12%] w-[2px] mf-anim"
            style={{
              left: `${FRACTURE_TRACK_PERCENT - 34}%`,
              background: "#00E5FF",
              boxShadow: "0 0 12px rgba(0,229,255,0.9)",
              animation: "mf-cut-armed 1.5s ease-in-out infinite"
            }}
          />
        )}

        {/* The live cutting beam. */}
        {beamVisible && (
          <div
            className="absolute top-[6%] bottom-[6%] w-[2px]"
            style={{
              left: `${severed ? FRACTURE_TRACK_PERCENT : x}%`,
              background: severed ? "#FFC857" : "#00E5FF",
              boxShadow: severed
                ? "0 0 16px rgba(255,200,87,0.95)"
                : "0 0 14px rgba(0,229,255,0.95), 0 0 30px rgba(0,229,255,0.5)",
              transform: "translateX(-50%)",
              animation: severed ? "none" : undefined
            }}
          />
        )}

        <div className="absolute inset-x-0 bottom-1 flex items-center justify-between px-3 pointer-events-none">
          <span className="mono text-[6.5px] tracking-[0.18em] text-[#E8E6E1]/30">
            {severed ? "DECK FLAT" : armed ? (dragging ? "SLICING…" : "PRESS & DRAG →") : "AWAITING ROOT"}
          </span>
          <span className="mono text-[6.5px] tracking-[0.18em] text-[#00E5FF]/50">MONO-BLADE</span>
        </div>
      </div>

      {!armed && !severed && (
        <div className="mono mt-2 text-[7px] tracking-[0.16em] text-[#E8E6E1]/30">
          THE BLADE WILL NOT ARM UNTIL THE CANCELLING ROOT IS NAMED ABOVE
        </div>
      )}
    </div>
  );
}


/* The two gates stacked into the "sever station": name the root, then cut it. */
function BladeSliceStation({ seed, rootPicked, severed, onPickRoot, onSever, onMiss, progress }) {
  return (
    <div className="w-full max-w-[520px] mx-auto flex flex-col gap-2.5">
      <RootIdentifier seed={seed} rootPicked={rootPicked} onPick={onPickRoot} />
      <CutLine
        seed={seed}
        armed={Boolean(rootPicked)}
        severed={severed}
        onSever={onSever}
        onMiss={onMiss}
        progress={progress}
      />
    </div>
  );
}

/* The cancelled factors disintegrating out of the fraction plate. */
function CancellationPlate({ seed, severed }) {
  return (
    <div className="relative w-full max-w-[420px] mx-auto border border-[#E8E6E1]/12 bg-[#0A0C14]/85 px-5 py-4">
      <div className="mono text-[7px] tracking-[0.28em] text-[#E8E6E1]/35 mb-2">
        FRACTURE ALGEBRA // SCRATCHPAD
      </div>
      <div className="mono flex items-center justify-center gap-3 text-[15px] text-[#E8E6E1]/90">
        <span className="inline-flex flex-col items-center">
          <span className="relative px-2">
            {seed.numeratorTerms.join(" ")}
            {severed && (
              <span
                className="absolute inset-0 mf-anim"
                style={{
                  animation: "mf-term-disintegrate 900ms ease-out both",
                  color: "#FFC857"
                }}
              >
                {seed.numeratorTerms.join(" ")}
              </span>
            )}
          </span>
          <span className="w-full h-[1px] bg-[#E8E6E1]/45 my-[3px]" />
          <span className="relative px-2">
            {seed.denominatorTerms.join(" ")}
            {severed && (
              <span
                className="absolute inset-0 mf-anim"
                style={{
                  animation: "mf-term-disintegrate 900ms ease-out both",
                  color: "#FFC857"
                }}
              >
                {seed.denominatorTerms.join(" ")}
              </span>
            )}
          </span>
        </span>
        <span className="text-[#FFC857] text-[18px]">→</span>
        <span className="text-[#FFC857]">{severed ? seed.deckLine : "?"}</span>
      </div>
      {severed && (
        <div className="mono mt-3 text-center text-[7.5px] tracking-[0.18em] text-[#00E5FF]/80">
          ({seed.cancelledTerm}) / (x {seed.approach > 0 ? "-" : "+"} {Math.abs(seed.approach)}) = 1
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   8b. AFTERSHOCK SURGE — the sudden 15-second twist on girder three.
   A fresh linear line must be crunched on paper and dialled in before the
   clock snaps the span. No answer carries over from the first weld.
   -------------------------------------------------------------------------- */

function AftershockSurge({ seed, value, secondsLeft, onChange, onSubmit }) {
  const urgent = secondsLeft <= 5;

  return (
    <div
      className="w-full max-w-[420px] mx-auto border bg-[#0C0709]/95 px-4 py-4 text-center"
      style={{
        borderColor: urgent ? "rgba(255,51,75,0.85)" : "rgba(255,51,75,0.5)",
        boxShadow: urgent ? "0 0 34px rgba(255,51,75,0.35)" : "0 0 18px rgba(255,51,75,0.18)",
        animation: "mf-rise-in 320ms ease-out both"
      }}
    >
      <div className="flex items-center justify-between border-b border-[#FF334B]/30 pb-2">
        <span className="mono text-[7.5px] tracking-[0.26em] text-[#FF334B] font-bold">
          AFTERSHOCK SURGE // GIRDER THREE
        </span>
        <span
          className="mono text-[15px] font-bold"
          style={{
            color: urgent ? "#FF334B" : "#FFC857",
            animation: urgent ? "mf-aftershock-lamp 700ms ease-in-out infinite" : "none"
          }}
        >
          {String(secondsLeft).padStart(2, "0")}s
        </span>
      </div>

      <div className="mono mt-2.5 text-[9px] tracking-[0.18em] text-[#E8E6E1]/50">
        LOAD TRANSFER SHIFTED TO A NEW LINE
      </div>
      <div className="font-serif mt-1 text-[21px] text-[#E8E6E1]">{seed.aftershockLine}</div>
      <div className="mono mt-1 text-[7.5px] tracking-[0.14em] text-[#FFC857]/85">
        CRUNCH IT ON PAPER AT x = {seed.approach} → {seed.aftershockPaper} = ?
      </div>

      {/* Secondary pin readout */}
      <div className="mt-3 h-12 border border-[#FF334B]/60 bg-[#07090E] flex items-center justify-between px-4">
        <span className="mono text-[7px] tracking-[0.22em] text-[#FF334B]/60">SECONDARY PIN</span>
        <span className="mono text-[17px] font-bold tracking-[0.12em] text-[#FF334B]">
          {value || "— — — —"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 mt-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "±", "0", "."].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            className="h-9 border border-[#FF334B]/35 bg-[#07090E] mono text-[12px] text-[#E8E6E1]/85 hover:border-[#FF334B] hover:text-[#FF334B] active:scale-[0.96] transition-all"
          >
            {k}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-1.5 mt-1.5">
        <button
          type="button"
          onClick={() => onChange("DEL")}
          className="h-10 border border-[#E8E6E1]/18 mono text-[8.5px] tracking-[0.2em] text-[#E8E6E1]/55 hover:text-[#E8E6E1]"
        >
          DEL
        </button>
        <button
          type="button"
          onClick={() => onChange("CLR")}
          className="h-10 border border-[#E8E6E1]/18 mono text-[8.5px] tracking-[0.2em] text-[#E8E6E1]/55 hover:text-[#E8E6E1]"
        >
          CLR
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="h-10 border border-[#FF334B] bg-[#FF334B]/15 mono text-[8.5px] tracking-[0.18em] font-bold text-[#FF8E9B] hover:bg-[#FF334B]/25 active:scale-[0.98]"
        >
          SLAM PIN
        </button>
      </div>

      <div className="mono mt-2 text-[6.5px] tracking-[0.16em] text-[#E8E6E1]/25">
        FOUR FIXED PLACES · TOLERANCE ±0.00005
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   9. MECHANICAL HEIGHT TUMBLER
   The student solves the reduced line ON PAPER and types the height at four
   fixed-point places (e.g. "4.0000"). Drum reels rotate like a machine.
   -------------------------------------------------------------------------- */

function HeightTumbler({ seed, value, onChange, onSubmit, welded, error }) {
  const digits = value.padEnd(HEIGHT_DECIMALS + 2, " ").slice(0, HEIGHT_DECIMALS + 2);

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <div className="border border-[#E8E6E1]/14 bg-[#0A0C14]/90 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="mono text-[7px] tracking-[0.26em] text-[#E8E6E1]/40">HEIGHT TUMBLER</span>
          <span className="mono text-[7px] tracking-[0.26em] text-[#FFC857]/70">
            {HEIGHT_DECIMALS} PLACES
          </span>
        </div>

        {/* Drum window */}
        <div
          className={`mt-3 h-16 flex items-center justify-center gap-[2px] border bg-[#07090E] ${error ? "border-[#FF334B]" : welded ? "border-[#FFC857]" : "border-[#E8E6E1]/20"
            }`}
          style={{
            boxShadow: welded
              ? "inset 0 0 22px rgba(255,200,87,0.22)"
              : error
                ? "inset 0 0 18px rgba(255,51,75,0.18)"
                : "inset 0 0 14px rgba(0,0,0,0.8)"
          }}
        >
          {digits.split("").map((ch, i) => (
            <span
              key={`drum-${i}`}
              className="mono w-[26px] md:w-[30px] text-center text-[19px] leading-none"
              style={{
                color: ch === "." ? "#FFC857" : ch.trim() ? "#E8E6E1" : "#E8E6E1",
                opacity: ch.trim() ? 1 : 0.16,
                textShadow: ch.trim() ? "0 0 10px rgba(232,230,225,0.25)" : "none"
              }}
            >
              {ch === " " ? "·" : ch}
            </span>
          ))}
        </div>

        {/* Keypad: digits, dot, sign, backspace, weld */}
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "±", "0", "."].map((k) => (
            <button
              key={k}
              type="button"
              disabled={welded}
              onClick={() => onChange(k)}
              className="h-10 border border-[#E8E6E1]/18 bg-[#0A0C14] mono text-[13px] text-[#E8E6E1]/85 hover:border-[#FFC857]/70 hover:text-[#FFC857] active:scale-[0.96] transition-all disabled:opacity-30"
            >
              {k}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1.5 mt-1.5">
          <button
            type="button"
            disabled={welded}
            onClick={() => onChange("DEL")}
            className="h-10 border border-[#E8E6E1]/18 mono text-[8.5px] tracking-[0.2em] text-[#E8E6E1]/55 hover:text-[#E8E6E1] disabled:opacity-30"
          >
            DEL
          </button>
          <button
            type="button"
            disabled={welded}
            onClick={() => onChange("CLR")}
            className="h-10 border border-[#E8E6E1]/18 mono text-[8.5px] tracking-[0.2em] text-[#E8E6E1]/55 hover:text-[#E8E6E1] disabled:opacity-30"
          >
            CLR
          </button>
          <button
            type="button"
            disabled={welded}
            onClick={onSubmit}
            className="h-10 border border-[#FFC857] bg-[#FFC857]/10 mono text-[8.5px] tracking-[0.2em] font-bold text-[#FFC857] hover:bg-[#FFC857]/20 active:scale-[0.98] disabled:opacity-30"
          >
            WELD
          </button>
        </div>

        <div className="mono mt-2.5 text-center text-[7px] tracking-[0.16em] leading-relaxed text-[#E8E6E1]/30">
          SOLVE ON PAPER: y = {seed.deckLine} at x = {seed.approach} → {seed.paperWork} = ?
        </div>
      </div>

      {error && (
        <div className="mono mt-2 text-center text-[7.5px] tracking-[0.16em] text-[#FF334B]">
          TUMBLER REJECTED — HEIGHT DOES NOT MATCH THE REDUCED LINE
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   10. SAGE — the mentor's voice. Reactive: briefings, cold retorts, and a
   sharp acknowledgement on victory. Falls back to the strike ladder when a
   mistake has no dedicated beat.
   -------------------------------------------------------------------------- */

function SagePanel({ line }) {
  if (!line) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-[460px]"
      style={{ animation: "mf-sage-speak 320ms ease-out both" }}
      role="status"
      aria-live="polite"
    >
      <div className="relative border border-[#FFC857]/45 bg-[#07090E]/96 backdrop-blur-md px-4 py-3">
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#FFC857]" />
        <div className="flex items-center justify-between mb-1.5">
          <div className="mono text-[6.5px] tracking-[0.3em] text-[#FFC857]/75">{line.tag}</div>
          <div className="mono text-[6px] tracking-[0.24em] text-[#E8E6E1]/25">SAGE // LIVE</div>
        </div>
        <div className="font-garamond italic text-[14px] leading-snug text-[#E8E6E1]">
          “{line.quote}”
        </div>
        <div className="mono mt-1.5 text-[6.5px] tracking-[0.24em] text-[#E8E6E1]/30">— SAGE</div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   11. ARCHIVIST LOCKOUT — 30s blueprint debrief, then a NEW VARIANT SEED
   -------------------------------------------------------------------------- */

function ArchivistLockout({ seed, secondsLeft, onReset }) {
  const total = LOCKOUT_SECONDS;
  const progress = 1 - secondsLeft / total;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#07090E]/96 backdrop-blur-sm"
      style={{ animation: "mf-veil-in 320ms ease-out both" }}
      role="dialog"
      aria-modal="true"
      aria-label="Archivist lockout"
    >
      <div className="relative w-full max-w-[440px] border border-[#FF334B]/45 bg-[#0A0C14] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] mf-anim"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,51,75,0.7) 0 1px, transparent 1px 4px)",
            animation: "mf-scanline 2.6s linear infinite"
          }}
        />
        <div className="relative px-5 py-5">
          <div className="mono text-[7px] tracking-[0.32em] text-[#FF334B]">ARCHIVIST LOCKOUT // SEALED</div>
          <div className="font-serif mt-2 text-[17px] text-[#E8E6E1]">BLUEPRINT DEBRIEF</div>
          <div className="mono mt-1 text-[7.5px] tracking-[0.16em] text-[#E8E6E1]/40">
            {seed.label} · {seed.approachLabel} · DO NOT GUESS AGAIN.
          </div>

          <div className="mt-4 space-y-2.5 font-garamond text-[13.5px] leading-snug text-[#E8E6E1]/85">
            <p>
              The fracture is a rational function whose denominator vanishes at
              {" "}x = {seed.approach}. Direct substitution cannot answer it.
            </p>
            <p className="mono text-[9.5px] tracking-[0.08em] text-[#00E5FF]/85">
              ({seed.numeratorTerms.join(" ")}) / ({seed.denominatorTerms.join(" ")}) = (
              {seed.cancelledTerm})(
              {seed.approach > 0 ? `x + ${seed.approach}` : `x - ${Math.abs(seed.approach)}`}) / (
              {seed.cancelledTerm})
            </p>
            <p>
              Cancel the shared root — never the whole structure — then evaluate
              the reduced line <span className="text-[#FFC857]">y = {seed.deckLine}</span> at
              x = {seed.approach} to weld the deck.
            </p>
          </div>

          <div className="mt-5 h-[1px] w-full bg-[#E8E6E1]/12 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-[#FF334B]"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between mono text-[7px] tracking-[0.22em]">
            <span className="text-[#E8E6E1]/35">DEBRIEF HOLD</span>
            <span className="text-[#FF334B]">{String(secondsLeft).padStart(2, "0")}s</span>
          </div>

          <button
            type="button"
            disabled={secondsLeft > 0}
            onClick={onReset}
            className="mt-4 w-full h-11 border border-[#FFC857] mono text-[9px] tracking-[0.24em] font-bold text-[#FFC857] hover:bg-[#FFC857]/10 transition-all disabled:opacity-30 disabled:border-[#E8E6E1]/20 disabled:text-[#E8E6E1]/35"
          >
            {secondsLeft > 0 ? `RESEALING NODE… ${secondsLeft}s` : "RESET NODE — NEW VARIANT SEED"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   12. MINDFORGE ACT I — MASTER NODE
   Props:
     onExit            () => void          leave the simulation
     onComplete        (payload) => void   deck welded (act mastered)
     onToast           (message) => void   host-level toast (optional)
     initialSeedIndex  number              which curated variant to open on
     muted             boolean             silence the procedural synth
   -------------------------------------------------------------------------- */

export default function MindForgeActOne({
  onExit,
  onComplete,
  onToast,
  initialSeedIndex = 0,
  muted = false
}) {
  const cue = useAudioBridge(muted);

  const [seedIndex, setSeedIndex] = useState(initialSeedIndex % SEED_VARIANTS.length);
  const seed = SEED_VARIANTS[seedIndex];

  const [phase, setPhase] = useState("airlock"); // airlock | deck
  const [diagnostic, setDiagnostic] = useState("");
  const [releasing, setReleasing] = useState(false);

  /* ---- TRIAL 01 GATE STATE --------------------------------------------- */
  const [rootPicked, setRootPicked] = useState(null); // the root named on the scratchpad
  const [severed, setSevered] = useState(false);
  const [welding, setWelding] = useState(false);
  const [welded, setWelded] = useState(false);
  const [heightInput, setHeightInput] = useState("");
  const [heightError, setHeightError] = useState(false);

  /* ---- AFTERSHOCK SURGE ------------------------------------------------- */
  const [aftershock, setAftershock] = useState(false);
  const [aftershockLeft, setAftershockLeft] = useState(AFTERSHOCK_SECONDS);
  const [aftershockInput, setAftershockInput] = useState("");
  const [aftershockError, setAftershockError] = useState(false);

  const [strikes, setStrikes] = useState(0);
  const [sagePulse, setSagePulse] = useState(0);
  const [shearFlash, setShearFlash] = useState(0);
  const [lockout, setLockout] = useState(false);
  const [lockoutLeft, setLockoutLeft] = useState(LOCKOUT_SECONDS);

  /* Sage's live line: seeded with the gate briefing so the deck is never
     silent, then replaced by reactive beats as the apprentice acts. */
  const [sageLine, setSageLine] = useState(SAGE_LINES.hold);
  const sageTimer = useRef(null);
  const cutProgress = useRef(0);

  const shear = useMemo(
    () => shearReadout({ strikes, aftershock, welded }),
    [strikes, aftershock, welded]
  );

  // Tear down the dialogue timer if the node unmounts mid-line.
  useEffect(() => () => {
    if (sageTimer.current) clearTimeout(sageTimer.current);
  }, []);

  /* ---- STRIKE ESCALATION ------------------------------------------------ */
  const registerStrike = useCallback(
    (cueName) => {
      cue(cueName);
      setStrikes((prev) => {
        const next = prev + 1;
        setShearFlash(Date.now());
        if (next >= 3) {
          setLockout(true);
          setLockoutLeft(LOCKOUT_SECONDS);
          setSagePulse(3);
          setSageLine({ tag: SAGE_STRIKES[2].tag, quote: SAGE_STRIKES[2].quote });
          cue("playLockout");
        } else {
          setSagePulse(next);
          setSageLine({ tag: SAGE_STRIKES[next - 1].tag, quote: SAGE_STRIKES[next - 1].quote });
        }
        return next;
      });
    },
    [cue]
  );

  /* ---- 30s LOCKOUT COUNTDOWN ------------------------------------------- */
  useEffect(() => {
    if (!lockout) return undefined;
    if (lockoutLeft <= 0) return undefined;
    const id = setTimeout(() => setLockoutLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [lockout, lockoutLeft]);

  /* ---- 15s AFTERSHOCK COUNTDOWN ---------------------------------------- */
  useEffect(() => {
    if (!aftershock) return undefined;
    if (aftershockLeft <= 0) {
      // The clock beat the apprentice: girder three shears, a strike lands,
      // and the surge re-arms with a fresh window. The seed is untouched.
      setAftershock(false);
      setAftershockLeft(AFTERSHOCK_SECONDS);
      setAftershockInput("");
      setSageLine(SAGE_LINES.surgeTimeout);
      registerStrike("playAlarm");
      return undefined;
    }
    const id = setTimeout(() => setAftershockLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [aftershock, aftershockLeft, registerStrike]);

  /* ---- RESET WITH A NEW VARIANT SEED ----------------------------------- */
  const resetNode = useCallback(
    (nextSeedIndex) => {
      setSeedIndex((current) => {
        const next = typeof nextSeedIndex === "number" ? nextSeedIndex % SEED_VARIANTS.length : (current + 1) % SEED_VARIANTS.length;
        return next;
      });
      setPhase("airlock");
      setDiagnostic("");
      setReleasing(false);
      setRootPicked(null);
      setSevered(false);
      setWelding(false);
      setWelded(false);
      setHeightInput("");
      setHeightError(false);
      setAftershock(false);
      setAftershockLeft(AFTERSHOCK_SECONDS);
      setAftershockInput("");
      setAftershockError(false);
      setStrikes(0);
      setSagePulse(0);
      setShearFlash(0);
      setLockout(false);
      setLockoutLeft(LOCKOUT_SECONDS);
      setSageLine(SAGE_LINES.hold);
      cutProgress.current = 0;
      cue("playSeal");
    },
    [cue]
  );
  /* ---- PHASE 0 ACTIONS ------------------------------------------------- */
  const handleKeypad = (token) => {
    if (releasing) return;
    cue("playClick");
    setDiagnostic((prev) => (prev.length >= 5 ? prev : prev + token));
  };

  const handleClear = () => {
    cue("playClick");
    setDiagnostic("");
  };

  const commitDiagnostic = () => {
    if (releasing) return;
    if (diagnostic === expectedDiagnostic(seed)) {
      cue("playPneumatic");
      setReleasing(true);
      if (onToast) onToast("0/0 indeterminate form logged. Pneumatic hatch unbolted.");
      // Pneumatic hatch release, then the deck is revealed.
      setTimeout(() => {
        setReleasing(false);
        setPhase("deck");
      }, 1150);
    } else {
      registerStrike("playAlarm");
      setDiagnostic("");
      if (onToast) onToast("Substitution refused. The register wants the indeterminate form.");
    }
  };

  /* ---- PHASE 1 ACTIONS ------------------------------------------------- */

  /* GATE 01 · the apprentice names the cancelling root. A wrong name is a
     strike (Sage is cold about it) and the blade stays locked. */
  const handlePickRoot = (option) => {
    if (severed) return;
    if (option === seed.cancelledTerm) {
      cue("playSpark");
      setRootPicked(option);
      setSageLine(SAGE_LINES.severArmed);
      if (onToast) onToast(`Root ${option} held. Drag the cutting line across the singularity.`);
    } else {
      setSageLine(SAGE_LINES.wrongRoot);
      registerStrike("playAlarm");
      if (onToast) onToast(`${option} does not cancel. The blade will not arm.`);
    }
  };

  /* GATE 02 · the cyan cutting line completed its pass across the hole. */
  const handleSever = () => {
    if (severed || !rootPicked || rootPicked !== seed.cancelledTerm) return;
    cue("playSlice");
    setSevered(true);
    cutProgress.current = 0;
    setSageLine(SAGE_LINES.severed);
    if (onToast) onToast(`Root (${seed.cancelledTerm}) severed. Deck reveals y = ${seed.deckLine}.`);
  };

  /* The line was dragged but never reached the far side of the hole. */
  const handleCutMiss = () => {
    if (severed) return;
    setSageLine({
      tag: "GATE 02 // INCOMPLETE PASS",
      quote:
        "You dragged a line and stopped short of the hole. The fracture is still breathing. Run the beam all the way across."
    });
    if (onToast) onToast("Incomplete pass. The cutting line must cross the singularity.");
  };

  /* GATE 03 · the primary height tumbler. */
  const handleTumblerKey = (token) => {
    if (welded || aftershock) return;
    setHeightError(false);
    if (token === "CLR") {
      setHeightInput("");
      return;
    }
    if (token === "DEL") {
      setHeightInput((prev) => prev.slice(0, -1));
      return;
    }
    if (token === "±") {
      setHeightInput((prev) => (prev.startsWith("-") ? prev.slice(1) : `-${prev}`));
      return;
    }
    if (token === ".") {
      setHeightInput((prev) => {
        if (prev.includes(".")) return prev;
        if (!prev) return "0.";
        if (prev === "-") return "-0.";
        return `${prev}.`;
      });
      return;
    }
    // Digits — cap at two integer places + four decimals ("-4.0000").
    setHeightInput((prev) => {
      const decimals = prev.split(".")[1];
      if (decimals && decimals.length >= HEIGHT_DECIMALS) return prev;
      const trimmed = prev.replace(/^-?0+(?=\d)/, "");
      return `${trimmed}${token}`;
    });
  };

  const submitHeight = () => {
    if (welded || aftershock || welding) return;

    if (!severed) {
      setSageLine(SAGE_LINES.measureLocked);
      registerStrike("playAlarm");
      if (onToast) onToast("The fracture is still live. Sever the matching root first.");
      return;
    }

    if (heightMatches(heightInput, seed.targetHeight)) {
      setWelding(true);
      cue("playWeld");
      setTimeout(() => {
        setWelding(false);
        setWelded(true);
        // THE TWIST: the primary weld immediately tears girder three.
        setAftershock(true);
        setAftershockLeft(AFTERSHOCK_SECONDS);
        setAftershockInput("");
        setAftershockError(false);
        setHeightInput("");
        setSageLine(SAGE_LINES.surge);
        cue("playSurge");
        if (onToast) onToast("Primary weld locked — AFTERSHOCK SURGE on girder three. 15 seconds.");
      }, 900);
    } else {
      setHeightError(true);
      setSageLine(SAGE_LINES.wrongHeight);
      registerStrike("playAlarm");
    }
  };

  /* GATE 04 · the secondary pin on girder three. */
  const handleAftershockKey = (token) => {
    if (!aftershock) return;
    setAftershockError(false);
    cue("playClick");
    if (token === "CLR") {
      setAftershockInput("");
      return;
    }
    if (token === "DEL") {
      setAftershockInput((prev) => prev.slice(0, -1));
      return;
    }
    if (token === "±") {
      setAftershockInput((prev) => (prev.startsWith("-") ? prev.slice(1) : `-${prev}`));
      return;
    }
    if (token === ".") {
      setAftershockInput((prev) => {
        if (prev.includes(".")) return prev;
        if (!prev) return "0.";
        if (prev === "-") return "-0.";
        return `${prev}.`;
      });
      return;
    }
    setAftershockInput((prev) => {
      const decimals = prev.split(".")[1];
      if (decimals && decimals.length >= HEIGHT_DECIMALS) return prev;
      const trimmed = prev.replace(/^-?0+(?=\d)/, "");
      return `${trimmed}${token}`;
    });
  };

  const submitAftershock = () => {
    if (!aftershock) return;

    if (heightMatches(aftershockInput, seed.aftershockTarget)) {
      setAftershock(false);
      setAftershockInput("");
      setSageLine(SAGE_LINES.victory);
      cue("playFuse");
      if (onToast) onToast(`Secondary pin slammed at ${formatHeight(seed.aftershockTarget)}. Span fused.`);
      if (onComplete) {
        onComplete({
          act: 1,
          seedId: seed.id,
          height: seed.targetHeight,
          aftershockHeight: seed.aftershockTarget,
          strikes
        });
      }
    } else {
      setAftershockError(true);
      setSageLine(SAGE_LINES.wrongPin);
      registerStrike("playAlarm");
    }
  };

  /* ---- RENDER: PHASE 0 — AIR-LOCK DIAGNOSTIC --------------------------- */
  const header = (
    <header className="relative z-20 flex items-start justify-between gap-3 border-b border-[#E8E6E1]/12 px-4 md:px-8 py-3">
      <div className="min-w-0">
        <button
          type="button"
          onClick={onExit}
          className="mono text-[7.5px] tracking-[0.2em] text-[#E8E6E1]/45 hover:text-[#FFC857] transition-colors"
        >
          ← EXIT SIMULATION
        </button>
        <div className="font-serif mt-1 text-[11px] md:text-[13px] tracking-[0.14em] text-[#E8E6E1] truncate">
          MINDFORGE // SAGE FORGE 09
        </div>
        <div className="mono mt-0.5 text-[6.5px] tracking-[0.22em] text-[#E8E6E1]/30">
          ACT I — THE FRACTURED LIMIT
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="mono text-[6px] tracking-[0.22em] text-[#E8E6E1]/30">SEED</div>
        <div className="mono text-[8px] tracking-[0.12em] text-[#00E5FF]">{seed.label}</div>
        <div className="mono text-[6.5px] tracking-[0.12em] text-[#E8E6E1]/40 mt-0.5">{seed.approachLabel}</div>
      </div>
    </header>
  );

  const strikeDots = (
    <div className="flex items-center gap-1.5" aria-label={`strikes ${strikes} of 3`}>
      {[1, 2, 3].map((n) => (
        <span
          key={`strike-${n}`}
          className="w-1.5 h-1.5 rounded-full transition-colors"
          style={{
            background: strikes >= n ? "#FF334B" : "rgba(232,230,225,0.16)",
            boxShadow: strikes >= n ? "0 0 8px rgba(255,51,75,0.8)" : "none"
          }}
        />
      ))}
    </div>
  );
  const airlockPhase = (
    <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6">
      {/* Pneumatic hatch doors */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[58%] overflow-hidden opacity-[0.5]">
        <div
          className="absolute left-0 right-0 top-0 h-1/2 bg-[linear-gradient(180deg,#101520,#0A0C14)] border-b border-[#00E5FF]/20 transition-transform duration-700"
          style={{ transform: releasing ? "translateY(-100%)" : "translateY(0)" }}
        />
        <div
          className="absolute left-0 right-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,#101520,#0A0C14)] border-t border-[#00E5FF]/20 transition-transform duration-700"
          style={{ transform: releasing ? "translateY(100%)" : "translateY(0)" }}
        />
      </div>

      <div className="relative w-full max-w-[420px] text-center mb-4">
        <div className="mono text-[7px] tracking-[0.34em] text-[#00E5FF]/70">PHASE 00 / PRE-ENTRY</div>
        <h1 className="font-serif mt-1.5 text-[16px] md:text-[18px] tracking-[0.12em] text-[#E8E6E1]">
          AIR-LOCK DIAGNOSTIC
        </h1>
        <p className="font-garamond italic mt-1 text-[12.5px] text-[#E8E6E1]/55">
          Substitute directly. The hatch opens only for the form that cannot be computed.
        </p>
      </div>

      <AirlockTerminal
        seed={seed}
        value={diagnostic}
        releasing={releasing}
        onKey={handleKeypad}
        onCommit={commitDiagnostic}
        onClear={handleClear}
      />

      <div className="relative mt-5 flex items-center gap-3">
        <span className="mono text-[6.5px] tracking-[0.24em] text-[#E8E6E1]/25">STRIKES</span>
        {strikeDots}
      </div>
    </div>

  /* ---- RENDER: PHASE 1 — TRIAL 01 -------------------------------------- */
  const deckPhase = (
    <div className="relative z-10 flex-1 flex flex-col">
      <SkybridgeCanvas
        seed={seed}
        severed={severed}
        welded={welded}
        aftershock={aftershock}
        shear={shear}
        flash={shearFlash}
      />

      {/* Readability scrim: the skybridge stays visible as a backdrop while
          the instrument panel remains legible on phones and tablets. */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,9,14,0.92) 0%, rgba(7,9,14,0.72) 28%, rgba(7,9,14,0.80) 72%, rgba(7,9,14,0.96) 100%)"
        }}
      />

      <div className="relative z-20 flex-1 overflow-y-auto px-4 md:px-8 pt-4 pb-28">
        <div className="w-full max-w-[520px] mx-auto">
          <div className="text-center mb-4">
            <div className="mono text-[7px] tracking-[0.34em] text-[#FFC857]/80">PHASE 01 / TRIAL 01</div>
            <h1 className="font-serif mt-1.5 text-[15px] md:text-[18px] tracking-[0.1em] text-[#E8E6E1]">
              THE MONOMOLECULAR SEVERING BLADE
            </h1>
            <p className="font-garamond italic mt-1 text-[12px] text-[#E8E6E1]/55">
              {aftershock
                ? `Girder three is shearing. ${seed.aftershockLine} at x = ${seed.approach}. You have ${aftershockLeft}s.`
                : welded
                  ? "The deck is welded. The limit has been paid for."
                  : severed
                    ? `The root is gone. Work y = ${seed.deckLine} at x = ${seed.approach} on paper, then dial it.`
                    : `A fracture at x = ${seed.approach}. Name the root, then cut it out of the deck.`}
            </p>
          </div>

          <CancellationPlate seed={seed} severed={severed} />

          {/* GATES 01 + 02 — name the root, then drag the cutting line. */}
          <div className="mt-4">
            <BladeSliceStation
              seed={seed}
              rootPicked={rootPicked}
              severed={severed}
              onPickRoot={handlePickRoot}
              onSever={handleSever}
              onMiss={handleCutMiss}
              progress={cutProgress}
            />
          </div>

          {/* GATE 03 — the primary height tumbler (locked until the sever) */}
          <div className={`mt-4 transition-opacity duration-500 ${severed && !aftershock ? "opacity-100" : "opacity-35 pointer-events-none"}`}>
            <HeightTumbler
              seed={seed}
              value={heightInput}
              onChange={handleTumblerKey}
              onSubmit={submitHeight}
              welded={welded}
              error={heightError}
            />
          </div>

          {/* GATE 04 — AFTERSHOCK SURGE (15s) */}
          {aftershock && (
            <div className="mt-4">
              <AftershockSurge
                seed={seed}
                value={aftershockInput}
                secondsLeft={aftershockLeft}
                onChange={handleAftershockKey}
                onSubmit={submitAftershock}
              />
              {aftershockError && (
                <div className="mono mt-1.5 text-center text-[7px] tracking-[0.2em] text-[#FF334B]/85">
                  PIN REFUSED — CHECK {seed.aftershockPaper}
                </div>
              )}
            </div>
          )}

          {welded && !aftershock && (
            <div
              className="mt-4 border border-[#FFC857] bg-[#FFC857]/[0.07] px-4 py-3 text-center"
              style={{ animation: "mf-amber-bloom 700ms ease-out both" }}
            >
              <div className="mono text-[7px] tracking-[0.3em] text-[#FFC857]/80">SPAN FUSED</div>
              <div className="font-serif mt-1 text-[13px] text-[#FFC857]">
                lim ({seed.approachLabel}) f(x) = {formatHeight(seed.targetHeight)}
              </div>
              <div className="mono mt-1 text-[7px] tracking-[0.18em] text-[#E8E6E1]/40">
                SECONDARY PIN {formatHeight(seed.aftershockTarget)} // DECK WELDED IN MOLTEN GOLD
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="mono text-[6.5px] tracking-[0.24em] text-[#E8E6E1]/25">STRIKES</span>
              {strikeDots}
            </div>
            <div className="flex items-center gap-2">
              <span className="mono text-[6.5px] tracking-[0.24em] text-[#E8E6E1]/25">SHEAR</span>
              <span
                className="mono text-[7.5px]"
                style={{
                  color: shear > 0.7 ? "#FF334B" : "#FFC857",
                  animation: shear > 0.7 ? "mf-aftershock-lamp 900ms ease-in-out infinite" : "none"
                }}
              >
                {shear.toFixed(2)} kN/m²
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ---- MASTER SHELL ---------------------------------------------------- */
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#07090E] text-[#E8E6E1] font-mono overflow-x-hidden selection:bg-[#FFC857]/25">
      <style>{ACT_ONE_KEYFRAMES}</style>

      {header}
      {phase === "airlock" ? airlockPhase : deckPhase}

      <SagePanel line={sageLine} />

      {lockout && (
        <ArchivistLockout
          seed={seed}
          secondsLeft={lockoutLeft}
          onReset={() => resetNode()}
        />
      )}

      <footer className="relative z-20 border-t border-[#E8E6E1]/10 px-4 md:px-8 py-2 flex items-center justify-between">
        <span className="mono text-[6px] tracking-[0.2em] text-[#E8E6E1]/25">
          TOLERANCE ±0.00005 // FIRST LIGHT CANON
        </span>
        <span className="mono text-[6px] tracking-[0.2em] text-[#E8E6E1]/25">
          {phase === "airlock"
            ? "HATCH SEALED"
            : aftershock
              ? "AFTERSHOCK // GIRDER THREE"
              : welded
                ? "LOADPATH STABLE"
                : "LOADPATH FRACTURED"}
        </span>
      </footer>
    </div>
  );
}





