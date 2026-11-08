import React, { useState } from 'react';

export default function RoadmapPlate({ onBackToAtelier, onEnterMindForge, actStatus: externalActStatus }) {
  const [localActStatus, setLocalActStatus] = useState({ 1: 'active', 2: 'locked', 3: 'locked' });
  // Host can drive mastery (e.g. after a weld); otherwise the plate owns it.
  const actStatus = externalActStatus || localActStatus;
  const setActStatus = setLocalActStatus;
  const [selectedActForTelemetry, setSelectedActForTelemetry] = useState(1);
  const [auraCracked, setAuraCracked] = useState(false);
  const [temperingTime, setTemperingTime] = useState("14:22");
  const [thoughtText, setThoughtText] = useState(null);

  const actThoughts = {
    1: "The bridge fractured at x = 2. Enter to weld the discontinuity before the loadpath collapses.",
    2: "Patience. The forge isn't hot enough. Seal integrity must be proven before acceleration is priced.",
    3: "The hourglass does not measure time. It measures what cannot be returned. You will not enter until acceleration is paid for."
  };

  const handleInspectAct = (actNum) => {
    setSelectedActForTelemetry(actNum);
    setThoughtText(actThoughts[actNum]);
  };

  return (
    <div className="min-h-screen w-full bg-[#07090E] text-[#E8E6E1] relative flex flex-col justify-between selection:bg-[#FFC857]/30 pb-12 font-mono">
      <style>{`
        @keyframes pulse-amber {
          0%, 100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 4px #FFC857); }
          50% { opacity: 0.65; transform: scale(1.15); filter: drop-shadow(0 0 10px rgba(255,200,87,0.7)); }
        }
        @keyframes pulse-cyan {
          0%, 100% { opacity: 0.9; filter: drop-shadow(0 0 6px #00E5FF); }
          50% { opacity: 0.5; filter: drop-shadow(0 0 12px rgba(0,229,255,0.8)); }
        }
      `}</style>

      {/* Blueprint Grid Background */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(232,230,225,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(232,230,225,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* Header */}
      <header className="relative z-10 w-full border-b border-[#E8E6E1]/15 px-6 md:px-10 py-5 flex items-start justify-between backdrop-blur-sm bg-[#07090E]/60">
        <div>
          <button 
            onClick={onBackToAtelier}
            className="text-[8px] md:text-[9px] tracking-[0.2em] text-[#E8E6E1]/50 hover:text-[#FFC857] transition-colors mb-2 flex items-center gap-1.5"
          >
            <span>←</span> <span>ROLL BACK TO ATELIER</span>
          </button>
          <h1 className="font-serif text-[12px] md:text-[14px] tracking-[0.28em] text-[#E8E6E1] font-medium">
            MINDFORGE // SECTOR 01: CALCULUS I // FOLIO 01
          </h1>
          <div className="text-[7.5px] md:text-[8px] tracking-[0.16em] text-[#E8E6E1]/40 mt-1 flex items-center gap-2">
            <span>MENTOR: SAGE</span>
            <span>·</span>
            <span>LOADPATH: <span className="text-[#00E5FF]">ACTIVE</span></span>
            <span>·</span>
            <span>T = 0.0s → 3.0s FREEFALL</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[7.5px] tracking-[0.2em] text-[#E8E6E1]/30 block">DWG: SF-01-CALC-01</span>
          <span className="text-[8px] md:text-[9px] tracking-[0.24em] text-[#FFC857] mt-0.5 block">
            PLATE 01 // FIRST LIGHT
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="relative z-10 flex-1 max-w-[1280px] w-full mx-auto px-6 md:px-10 py-8 grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-12 items-start my-auto">
        
        {/* LEFT PANE: Vertical Loadpath Spine */}
        <div className="relative w-full max-w-[540px] mx-auto flex flex-col items-center">
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-[#E8E6E1]/25">
            <div className="absolute top-[6%] -left-6 text-[7px] text-[#E8E6E1]/30">t=0.0s</div>
            <div className="absolute top-[36%] -left-6 text-[7px] text-[#E8E6E1]/30">t=1.0s</div>
            <div className="absolute top-[68%] -left-6 text-[7px] text-[#E8E6E1]/30">t=2.0s</div>
            <div className="absolute bottom-[2%] -left-6 text-[7px] text-[#E8E6E1]/30">t=3.0s</div>

            <div 
              className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#FFC857] shadow-[0_0_12px_#FFC857] transition-all duration-1000 ${actStatus[1] === 'mastered' ? 'top-[42%]' : 'top-[16%]'}`}
              style={{ animation: "pulse-amber 2.2s infinite" }}
            />
          </div>

          {/* ACT I NODE */}
          <div className="relative z-10 w-full my-6 cursor-pointer" onClick={() => handleInspectAct(1)}>
            <div className="relative bg-[#0A0C14] border border-[#00E5FF]/40 p-5 md:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.7)] transition-all hover:border-[#00E5FF]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[7px] tracking-[0.24em] text-[#00E5FF] uppercase block mb-1">
                    {actStatus[1] === 'mastered' ? "WELD SECURED // MASTERED" : "SECTOR 01 // LOADPATH ACTIVE"}
                  </span>
                  <h2 className="font-serif text-[17px] md:text-[19px] tracking-[0.14em] text-[#E8E6E1] font-medium">
                    ACT I: THE FRACTURED LIMIT
                  </h2>
                </div>
                <span className="text-[7.5px] tracking-[0.18em] border border-[#00E5FF]/40 text-[#00E5FF] px-2 py-0.5">
                  [ ACTIVE ]
                </span>
              </div>

              {/* Skybridge SVG */}
              <div className="mt-4 border border-[#E8E6E1]/10 bg-[#07090E]/80 p-3">
                <svg viewBox="0 0 220 72" className="w-full h-14 fill-none">
                  <path d="M10 60 L210 60" stroke="#E8E6E1" strokeWidth="0.5" strokeOpacity="0.25" />
                  <path d="M10 36 L90 36" stroke="#00E5FF" strokeWidth="1.2" />
                  <circle cx="100" cy="36" r="3.5" stroke="#00E5FF" strokeWidth="1.2" fill="#07090E" className="animate-[pulse-cyan_1.8s_infinite]" />
                  <path d="M110 36 L210 36" stroke="#00E5FF" strokeWidth="1.2" />
                  <path d="M10 36 L30 60 L50 36 L70 60 L90 36 M110 36 L130 60 L150 36 L170 60 L190 36 L210 60" stroke="#E8E6E1" strokeWidth="0.4" strokeOpacity="0.3" />
                  <line x1="100" y1="16" x2="100" y2="56" stroke="#FFC857" strokeWidth="0.6" strokeDasharray="2 2" />
                  <text x="106" y="24" fill="#FFC857" className="text-[6px]">x = 2 (0/0)</text>
                </svg>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#E8E6E1]/10 pt-3">
                <div className="text-[7px] tracking-[0.14em] text-[#E8E6E1]/40">
                  TOLERANCE: 0.00 // SHEAR: UNSTABLE // INTEGRITY: 68%
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEnterMindForge) onEnterMindForge(1);
                  }}
                  className="border border-[#00E5FF] px-4 py-1.5 font-serif text-[9px] tracking-[0.2em] text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors"
                >
                  ENTER MINDFORGE →
                </button>
              </div>
            </div>
          </div>

          {/* ACT II NODE (LOCKED) */}
          <div className="relative z-10 w-full my-6 cursor-pointer opacity-50 hover:opacity-75 transition-opacity" onClick={() => handleInspectAct(2)}>
            <div className="relative bg-[#07090E] border border-[#E8E6E1]/20 p-5 md:p-6 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[7px] tracking-[0.24em] text-[#E8E6E1]/40 uppercase block mb-1">
                    BULKHEAD SEALED // REQUIRES ACT I INTEGRITY
                  </span>
                  <h2 className="font-serif text-[16px] md:text-[18px] tracking-[0.14em] text-[#E8E6E1]/70 font-medium">
                    ACT II: THE COST OF ACCELERATION
                  </h2>
                </div>
                <span className="text-[7.5px] tracking-[0.18em] border border-[#E8E6E1]/20 text-[#E8E6E1]/40 px-2 py-0.5">
                  [ LOCKED ]
                </span>
              </div>
              <div className="mt-4 border border-[#E8E6E1]/10 bg-[#07090E]/60 p-3 flex items-center justify-center">
                <svg viewBox="0 0 220 64" className="w-full h-12 fill-none stroke-[#E8E6E1]/40">
                  <ellipse cx="110" cy="32" rx="48" ry="24" strokeWidth="0.8" />
                  <ellipse cx="110" cy="32" rx="32" ry="16" strokeWidth="0.6" strokeDasharray="4 2" />
                  <path d="M80 50 L140 14" stroke="#E8E6E1" strokeWidth="1" strokeOpacity="0.7" />
                </svg>
              </div>
            </div>
          </div>

          {/* ACT III NODE (LOCKED) */}
          <div className="relative z-10 w-full my-6 cursor-pointer opacity-30 hover:opacity-50 transition-opacity" onClick={() => handleInspectAct(3)}>
            <div className="relative bg-[#07090E] border border-[#E8E6E1]/10 p-5 md:p-6 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[7px] tracking-[0.24em] text-[#E8E6E1]/30 uppercase block mb-1">
                    DEEP ABYSS // ACCUMULATION SINGULARITY
                  </span>
                  <h2 className="font-serif text-[15px] md:text-[17px] tracking-[0.14em] text-[#E8E6E1]/50 font-medium">
                    ACT III: THE IRREVERSIBLE ACCUMULATION
                  </h2>
                </div>
                <span className="text-[7.5px] tracking-[0.18em] border border-[#E8E6E1]/10 text-[#E8E6E1]/30 px-2 py-0.5">
                  [ LOCKED ]
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: CAD Forensic Telemetry (Desktop Only) */}
        <aside className="hidden md:flex flex-col gap-6 sticky top-8">
          <div className="bg-[#0A0C14] border border-[#E8E6E1]/20 p-6 shadow-2xl">
            <div className="flex justify-between items-baseline border-b border-[#E8E6E1]/10 pb-3">
              <span className="font-serif text-[12px] tracking-[0.24em] text-[#E8E6E1]">CAD FORENSIC TELEMETRY</span>
              <span className="text-[7px] tracking-[0.18em] text-[#FFC857]">ACT 0{selectedActForTelemetry} // LIVE</span>
            </div>

            <div className="mt-6 border border-[#E8E6E1]/15 p-4 bg-[#07090E]">
              <div className="text-[7px] tracking-[0.2em] text-[#E8E6E1]/40 mb-3 uppercase">
                Structural Discontinuity Analysis
              </div>
              <div className="text-[8px] tracking-[0.14em] text-[#00E5FF]">
                lim (x→2) [ (x-2)(x+2) / (x-2) ] = 4.0000
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-[7.5px] tracking-[0.14em]">
              <div className="border border-[#E8E6E1]/10 p-2.5">
                <span className="opacity-40 block">TOLERANCE</span>
                <span className="text-[#00E5FF] mt-1 block">±0.000001 mm</span>
              </div>
              <div className="border border-[#E8E6E1]/10 p-2.5">
                <span className="opacity-40 block">SHEAR COEFFICIENT</span>
                <span className="text-[#FFC857] mt-1 block">CRITICAL // 0.68</span>
              </div>
            </div>
          </div>

          {thoughtText && (
            <div className="bg-[#E8E2D0] text-[#07090E] p-4 rounded-xl shadow-2xl border border-[#FFC857]/40">
              <div className="text-[6.5px] tracking-[0.2em] opacity-60 uppercase mb-1">Forge Master // Audit</div>
              <div className="font-serif italic text-[12px] leading-snug">{thoughtText}</div>
            </div>
          )}
        </aside>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-[#E8E6E1]/15 px-6 md:px-10 pt-4 flex flex-col md:flex-row items-center justify-between text-[7.5px] md:text-[8px] tracking-[0.18em] text-[#E8E6E1]/40 gap-2">
        <div>COORDINATE: MINDFORGE // CITADEL ENGINE // LOADPATH 01</div>
        <div>© SHADOWFORGE ACADEMY // FIRST LIGHT CANON</div>
      </footer>
    </div>
  );
}
