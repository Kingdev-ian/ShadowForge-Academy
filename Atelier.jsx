import React, { useState } from 'react';

export default function Atelier({ onOpenRoadmap, onLogout, onReplayIntro }) {
  const [thoughtText, setThoughtText] = useState("Apprentice. Light the forge.");
  const [activeFocus, setActiveFocus] = useState(null);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState("shadow");
  const [soundMuted, setSoundMuted] = useState(false);

  const loreResponses = {
    calc: "A prodigy who calculated everything... except the flaw. Enter his calculation.",
    crit: "The universal anchor. Grounding every discipline in the dark.",
    mindforge: "The first sector blazes. The other citadels wait in silence.",
    sealed: "Dormant sector. Only a Master may demand its unsealing.",
    vault: "The Archive Vault. Where failed calculations are dissected.",
    monolith: "The Monolith reflects your total discipline. Never let your halo crack.",
    idle: "Apprentice. Light the forge."
  };

  const handleInspect = (key) => {
    setActiveFocus(key === "idle" ? null : key);
    setThoughtText(loreResponses[key] || loreResponses.idle);
  };

  return (
    <div className="min-h-screen w-full bg-[#07090e] text-[#E8E2D0] antialiased overflow-x-clip relative selection:bg-[#FFC857]/20 pb-[96px] font-mono">
      <style>{`
        @keyframes sparkFlicker {
          0%, 100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 6px #FFC857); }
          50% { opacity: 0.85; transform: scale(1.08); filter: drop-shadow(0 0 14px rgba(255,200,87,0.7)); }
          78% { opacity: 1; transform: scale(0.96); }
        }
        @keyframes haloPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.95; }
          50% { transform: translate(-50%, -50%) scale(1.09); opacity: 0.58; }
        }
        @keyframes haloAura {
          0%, 100% { opacity: 0.22; transform: scale(1); }
          50% { opacity: 0.12; transform: scale(1.15); }
        }
        @keyframes edgeCrawl {
          0% { transform: translateY(100%); opacity: 0; }
          12% { opacity: 1; }
          88% { opacity: 1; }
          100% { transform: translateY(-140%); opacity: 0; }
        }
        @keyframes seamBreathe {
          0%, 100% { opacity: 0.9; box-shadow: 0 0 18px rgba(255,200,87,0.45), 0 0 40px rgba(255,200,87,0.14); }
          50% { opacity: 0.6; box-shadow: 0 0 10px rgba(255,200,87,0.2), 0 0 24px rgba(255,200,87,0.06); }
        }
        @keyframes bubbleIn {
          0% { opacity: 0; transform: translateY(6px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Background Radiance */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(232,226,208,0.06),transparent_50%),radial-gradient(90%_50%_at_50%_100%,rgba(255,200,87,0.04),transparent)]" />

      {/* Top Bar Navigation */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8">
        <div className="text-[10px] tracking-[0.28em] opacity-60">SHADOWFORGE / ACADEMY</div>
        <div className="text-[10px] tracking-[0.18em] opacity-40">ATELIER — SECTOR 01 ACTIVE</div>
      </div>

      {/* Central Monolith & Halo */}
      <section className="relative z-10 flex flex-col items-center pt-6 md:pt-2 pb-2">
        <div className="relative flex flex-col items-center">
          
          <div className="relative cursor-pointer" onClick={() => handleInspect("monolith")}>
            <div className="absolute left-1/2 top-[4.5%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
              <div className="relative w-[66px] h-[66px] md:w-[76px] md:h-[76px]">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(255,200,87,0.18),rgba(255,200,87,0.02)_62%,transparent_72%)]" style={{ animation: "haloAura 3.6s ease-in-out infinite" }} />
                <div className="absolute inset-[6px] rounded-full border border-[#FFC857]/90 shadow-[0_0_16px_rgba(255,200,87,0.45),inset_0_0_8px_rgba(255,200,87,0.25)]" style={{ animation: "haloPulse 3.8s ease-in-out infinite" }} />
                <div className="absolute inset-[14px] rounded-full border border-[#FFC857]/25" />
              </div>
            </div>

            <div className="absolute left-1/2 top-[4.5%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <div className="w-[9px] h-[9px] rounded-full bg-[#FFC857] shadow-[0_0_12px_#FFC857,0_0_28px_rgba(255,200,87,0.7)]" style={{ animation: "sparkFlicker 2.4s ease-in-out infinite" }} />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[20px] h-[20px] rounded-full bg-[#FFC857]/20 blur-[2px]" />
            </div>

            <svg viewBox="0 0 120 380" className="h-[48vh] md:h-[62vh] w-auto opacity-95" fill="none">
              <path d="M60 6 L67 18 L67 54 L74 62 L74 132 L80 140 L80 340 L40 340 L40 140 L46 132 L46 62 L53 54 L53 18 Z" stroke="#E8E2D0" strokeWidth="0.9" strokeOpacity="0.9" fill="none" />
              <path d="M53 54 L67 54 M46 132 L74 132 M40 340 L80 340" stroke="#E8E2D0" strokeWidth="0.5" strokeOpacity="0.28" />
              <path d="M60 6 L60 340" stroke="#E8E2D0" strokeWidth="0.35" strokeOpacity="0.18" strokeDasharray="3 4" />
              <path d="M53 18 L67 18 M54 26 L66 26 M55 38 L65 38" stroke="#E8E2D0" strokeWidth="0.35" strokeOpacity="0.22" />
              <path d="M46 62 L46 132 M74 62 L74 132 M53 132 L53 340 M67 132 L67 340" stroke="#E8E2D0" strokeWidth="0.35" strokeOpacity="0.16" />
              <path d="M60 12 L60 2" stroke="#FFC857" strokeWidth="0.6" strokeOpacity="0.5" />
              <path d="M28 340 L92 340 L90 352 L30 352 Z" stroke="#E8E2D0" strokeWidth="0.6" strokeOpacity="0.28" />
              <path d="M34 352 L86 352 L84 358 L36 358 Z" stroke="#E8E2D0" strokeWidth="0.4" strokeOpacity="0.18" />
              <g opacity="0.22">
                <ellipse cx="52" cy="344" rx="3.2" ry="1.2" fill="#E8E2D0" />
                <ellipse cx="68" cy="344" rx="3.2" ry="1.2" fill="#E8E2D0" />
              </g>
            </svg>
            <div className="pointer-events-none absolute left-1/2 top-[58%] -translate-x-1/2 w-[88px] md:w-[108px] h-[1px] bg-gradient-to-r from-transparent via-[#FFC857]/30 to-transparent blur-[0.3px]" />
          </div>

          <div className="mt-3 flex flex-col items-center gap-1 cursor-pointer" onClick={() => handleInspect("monolith")}>
            <div className="font-serif text-[22px] md:text-[26px] tracking-[0.18em] font-light">SHADOWFORGE</div>
            <div className="text-[9px] tracking-[0.32em] opacity-50 flex items-center gap-2">
              <span className="w-[14px] h-[1px] bg-[#E8E2D0]/30" />
              ACADEMY LIGHT // SOLID SPARK
              <span className="w-[14px] h-[1px] bg-[#E8E2D0]/30" />
            </div>
            <div className="text-[7.5px] tracking-[0.2em] text-[#FFC857]/80 mt-1 uppercase">
              CITADEL ENGINE // REPUTATION VERIFIED
            </div>
          </div>
        </div>

        {/* Horizon: 6 Citadels */}
        <div className="mt-8 md:mt-10 w-full relative">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E8E2D0]/10 to-transparent pointer-events-none" />
          
          <div className="flex gap-4 md:gap-7 overflow-x-auto no-scrollbar px-6 md:justify-center md:px-0 py-6 snap-x snap-mandatory">
            
            {/* MindForge (Lit) */}
            <div 
              className={`snap-center shrink-0 flex flex-col items-center gap-2 cursor-pointer transition-all ${activeFocus === "mindforge" ? "scale-[1.04]" : ""}`}
              onClick={() => handleInspect("mindforge")}
            >
              <div className="relative w-[96px] md:w-[124px] h-[84px] md:h-[94px]">
                <svg viewBox="0 0 120 80" className="w-full h-full fill-none">
                  <path d="M10 70 L30 18 L42 32 L60 8 L78 32 L90 18 L110 70 Z" fill="rgba(255,200,87,0.09)" stroke="#FFC857" strokeWidth="0.85" strokeOpacity={activeFocus === "mindforge" ? 1 : 0.78} />
                  <path d="M30 18 L30 70 M60 8 L60 70 M90 18 L90 70" stroke="#FFC857" strokeWidth="0.3" strokeOpacity="0.24" />
                  <circle cx="60" cy="12" r="2.4" fill="#FFC857" style={{ filter: "drop-shadow(0 0 8px #FFC857)" }} />
                </svg>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[64px] h-[1px] bg-[#FFC857]/60 blur-[0.5px]" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[82px] h-[14px] bg-[radial-gradient(50%_100%_at_50%_0%,rgba(255,200,87,0.18),transparent)] blur-[0.6px]" />
              </div>
              <div className="text-[8.5px] tracking-[0.22em] text-[#FFC857]/90">MINDFORGE // SECTOR 01</div>
              <div className="text-[6.5px] tracking-[0.16em] opacity-40 max-w-[140px] text-center leading-[1.2]">
                WORLD LIGHT // SAGE CONQUERED
              </div>
            </div>

            {/* 5 Dormant Citadels */}
            {[
              "stone remembers nothing",
              "where light refused",
              "the second silence",
              "unwritten weight",
              "vault of no name"
            ].map((quote, idx) => (
              <div 
                key={idx}
                className={`snap-center shrink-0 flex flex-col items-center gap-2 cursor-pointer transition-opacity ${activeFocus === "sealed" ? "opacity-80" : "opacity-[0.42] hover:opacity-70"}`}
                onClick={() => handleInspect("sealed")}
              >
                <div className="relative w-[84px] md:w-[108px] h-[72px] md:h-[84px]">
                  <svg viewBox="0 0 120 80" className="w-full h-full fill-none">
                    <path d="M12 70 L28 22 L44 36 L60 12 L76 36 L92 22 L108 70 Z" stroke="#E8E2D0" strokeWidth="0.6" strokeOpacity="0.55" />
                    <path d="M28 22 L28 70 M60 12 L60 70 M92 22 L92 70" stroke="#E8E2D0" strokeWidth="0.25" strokeOpacity="0.18" />
                  </svg>
                  <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-[#E8E2D0]/20 flex items-center justify-center bg-[#07090e]">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E8E6E1" strokeWidth="1.2" opacity="0.6">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                  </div>
                </div>
                <div className="text-[7.5px] tracking-[0.18em] max-w-[96px] text-center leading-[1.3] text-[#E8E6E1]/50">
                  “{quote}”
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Drafting Table / Atelier */}
      <section className="relative z-10 mt-6 md:mt-8 border-t border-[#E8E2D0]/[0.07] bg-[linear-gradient(180deg,rgba(232,226,208,0.02),transparent_30%)]">
        <div className="px-6 md:px-10 py-6 flex justify-between items-center">
          <div className="text-[10px] tracking-[0.3em] opacity-50">DRAFTING TABLE — ATELIER</div>
          <div className="text-[9px] tracking-[0.2em] text-[#FFC857]/80">FOLIO 01 — ACTIVE</div>
        </div>

        <div className="px-4 md:px-10 pb-6 flex flex-col md:flex-row gap-10 md:gap-16 items-start md:items-end justify-center max-w-[1120px] mx-auto">
          
          {/* Main Blueprint 01: Calculus I */}
          <div className="relative w-full md:w-[520px] shrink-0">
            <div 
              className={`group relative cursor-pointer transition-transform ${activeFocus === "calc" ? "scale-[1.015]" : ""}`}
              onClick={() => {
                handleInspect("calc");
                if (onOpenRoadmap) onOpenRoadmap();
              }}
            >
              <div className="absolute -inset-[15px] md:-inset-[20px] pointer-events-none">
                <svg viewBox="0 0 240 320" className="w-full h-full fill-none">
                  <rect x="8" y="8" width="224" height="304" rx="3" stroke="#E8E2D0" strokeWidth="0.28" strokeOpacity="0.13" strokeDasharray="7 9" />
                  <path d="M8 98 L8 8 L232 8" stroke="#FFC857" strokeWidth="1.35" strokeLinecap="round" strokeOpacity="0.95" strokeDasharray="24 76" style={{ filter: "drop-shadow(0 0 7px rgba(255,200,87,0.6))" }} />
                  <circle cx="8" cy="98" r="2.2" fill="#FFC857" opacity="0.9" style={{ filter: "drop-shadow(0 0 6px #FFC857)" }} />
                </svg>
              </div>

              <div className="relative bg-[#0e1016] border border-[#E8E2D0]/20 rounded-[2px] overflow-hidden shadow-[0_0_0_1px_rgba(232,226,208,0.04)_inset,12px_18px_40px_rgba(0,0,0,0.7)]">
                <div className="absolute left-0 top-0 bottom-0 w-[22px] bg-[linear-gradient(90deg,rgba(232,226,208,0.08),rgba(232,226,208,0.01))] border-r border-[#E8E2D0]/10" />
                <div className="absolute left-[22px] top-0 bottom-0 w-[1px] bg-[#E8E2D0]/10" />

                {/* Crawling Edge Spark */}
                <div className="absolute right-0 top-0 bottom-0 w-[3px] overflow-hidden bg-[#07090e]/60">
                  <div className="absolute inset-y-0 right-0 w-[1px] bg-[#FFC857]/30" />
                  <div className="absolute left-0 w-full h-[42px] bg-[#FFC857] shadow-[0_0_12px_#FFC857,0_0_22px_rgba(255,200,87,0.8)]" style={{ animation: "edgeCrawl 2.8s linear infinite" }} />
                </div>

                <div className="pl-[36px] pr-[22px] py-7 md:py-9">
                  <div className="flex justify-between items-start">
                    <div className="text-[9px] tracking-[0.22em] opacity-50 leading-[1.4]">
                      BLUEPRINT 01 // SECTOR: MINDFORGE<br />
                      CH.01 · SAGE · ACTIVE LOADPATH
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FFC857] shadow-[0_0_8px_#FFC857]" style={{ animation: "sparkFlicker 1.8s ease-in-out infinite" }} />
                      <span className="text-[8px] tracking-[0.2em] text-[#FFC857]">ACTIVE</span>
                    </div>
                  </div>

                  <div className="mt-6 relative">
                    <div className="font-serif text-[42px] md:text-[54px] leading-[0.9] tracking-[-0.02em] font-light">
                      <div>CALCULUS</div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-[30px] md:text-[36px] opacity-70">I</span>
                        <span className="text-[10px] tracking-[0.2em] opacity-40 translate-y-[-8px]">— EDITION SAGE</span>
                      </div>
                    </div>

                    <div className="mt-7 grid grid-cols-[1.2fr_0.8fr] gap-4">
                      <div className="border border-[#E8E2D0]/15 p-3 relative">
                        <div className="text-[7px] tracking-[0.2em] opacity-30 absolute -top-2 left-2 bg-[#0e1016] px-1">LIMITS / DERIVATIVE — DETAIL</div>
                        <svg viewBox="0 0 160 90" className="w-full h-[78px] fill-none">
                          <path d="M8 70 L152 70 M8 70 L8 8" stroke="#E8E2D0" strokeWidth="0.4" opacity="0.3" />
                          <path d="M8 58 C40 58, 60 30, 88 22 C118 14, 140 10, 152 6" stroke="#E8E2D0" strokeWidth="0.6" opacity="0.7" />
                          <circle cx="88" cy="22" r="1.8" fill="#FFC857" />
                          <path d="M88 22 L88 70" stroke="#FFC857" strokeWidth="0.25" strokeDasharray="2 3" opacity="0.5" />
                        </svg>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="border border-[#E8E2D0]/10 p-2">
                          <div className="text-[6px] opacity-30 uppercase">Rank Ladder</div>
                          <div className="mt-1 space-y-[3px]">
                            {["Apprentice", "Scholar", "Expert", "Shadow", "Elite", "Master"].map((rank, idx) => (
                              <div key={rank} className={`text-[7px] tracking-[0.14em] flex items-center gap-1.5 ${idx === 0 ? "text-[#FFC857]" : "opacity-25"}`}>
                                <span className={`w-[7px] h-[1px] ${idx === 0 ? "bg-[#FFC857]" : "bg-[#E8E2D0]"}`} />
                                {rank.toUpperCase()}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-end justify-between border-t border-[#E8E2D0]/10 pt-4">
                    <div>
                      <div className="text-[8px] tracking-[0.28em] opacity-40">CURRENT LEVEL</div>
                      <div className="font-serif text-[20px] tracking-[0.08em] mt-1 flex items-center gap-2">
                        Apprentice <span className="text-[10px] opacity-40 tracking-[0.2em]">→ SCHOLAR</span>
                      </div>
                    </div>
                    <span className="font-serif text-[12px] tracking-[0.18em] text-[#FFC857] group-hover:translate-x-1 transition-transform">
                      UNROLL ROADMAP →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Card: Critical Thinking */}
          <div className="relative w-[200px] md:w-[220px] self-end md:self-auto ml-auto md:ml-0 -mt-10 md:mt-0 opacity-80 hover:opacity-100 transition-opacity">
            <div className="bg-[#0a0c11] border border-[#E8E2D0]/[0.12] rounded-[1px] p-4 cursor-pointer" onClick={() => handleInspect("crit")}>
              <div className="text-[7px] tracking-[0.18em] opacity-35">BLUEPRINT 00 // UNIVERSAL</div>
              <div className="mt-4 font-serif text-[16px] leading-[0.95] tracking-[0.02em] font-light">CRITICAL<br /><span className="opacity-60 text-[13px]">THINKING</span></div>
              <div className="mt-4 border border-[#E8E6E1]/10 p-2">
                <svg viewBox="0 0 80 40" className="w-full h-[36px] fill-none">
                  <circle cx="40" cy="20" r="14" stroke="#E8E6E1" strokeWidth="0.3" opacity="0.25" />
                  <circle cx="40" cy="20" r="1.2" fill="#FFC857" opacity="0.5" />
                </svg>
              </div>
              <div className="text-[6.5px] tracking-[0.2em] opacity-30 mt-4">STATUS: AUTO-GRANTED</div>
            </div>
          </div>
        </div>

        {/* Archive Vault Door */}
        <div 
          className="relative w-full h-[78px] md:h-[88px] border-t border-[#E8E2D0]/10 bg-[#05060a] overflow-hidden cursor-pointer group"
          onClick={() => handleInspect("vault")}
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#FFC857]/70 group-hover:bg-[#FFC857] transition-colors" style={{ animation: "seamBreathe 3.5s ease-in-out infinite" }} />
          <div className="h-full flex items-center justify-between px-6 md:px-10">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-[1px] border border-[#E8E2D0]/15 flex items-center justify-center group-hover:border-[#FFC857]/30 transition-colors">
                <div className="w-3 h-3 border border-[#E8E2D0]/20 group-hover:border-[#FFC857]/40" />
              </div>
              <div>
                <div className="font-serif text-[14px] tracking-[0.14em]">ARCHIVE VAULT — SEALED — CODEX</div>
                <div className="text-[7px] tracking-[0.22em] opacity-30 mt-0.5">DISSECTING FAILED CALCULATIONS // RESTRICTED ACCESS</div>
              </div>
            </div>
            <div className="text-[7px] tracking-[0.2em] opacity-25 hidden md:block">SEALED UNTIL DISCIPLINE PROVEN</div>
          </div>
        </div>
      </section>

      {/* Fixed Forge Master Icon (Bottom-Left) */}
      <div className="fixed left-4 md:left-8 bottom-4 md:bottom-6 z-[60] flex flex-col items-start gap-3">
        
        {/* Thought Bubble */}
        <div className="max-w-[320px] md:max-w-[420px] animate-[bubbleIn_0.32s_ease] ml-1">
          <div className="relative bg-[#E8E2D0] text-[#07090e] rounded-[18px] rounded-bl-[6px] px-4 md:px-5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,200,87,0.15)]">
            <div className="flex items-start gap-2.5">
              <div className="mt-[1px] shrink-0 w-5 h-5 rounded-full bg-[#07090e] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFC857] animate-[sparkFlicker_2s_ease-in-out_infinite]" />
              </div>
              <span className="font-serif italic text-[13px] md:text-[14px] leading-[1.35] tracking-[0.01em]">{thoughtText}</span>
            </div>
            <div className="absolute -bottom-1 left-5 w-3 h-3 bg-[#E8E2D0] rotate-45 rounded-[1px]" />
          </div>
        </div>

        {/* Forge Master Circular Avatar (Tap to Open Dossier) */}
        <div className="relative group cursor-pointer" onClick={() => setDossierOpen(!dossierOpen)}>
          <div className="w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-full bg-[#101218] border border-[#E8E2D0]/20 shadow-[0_8px_28px_rgba(0,0,0,0.8),0_0_0_1px_rgba(232,226,208,0.06)_inset,0_0_18px_rgba(255,200,87,0.08)] flex items-center justify-center overflow-hidden hover:border-[#FFC857]/30 transition-colors">
            <svg viewBox="0 0 64 64" className="w-[52px] h-[52px] md:w-[58px] md:h-[58px] fill-none">
              <ellipse cx="32" cy="18" rx="9" ry="10" fill="#151821" stroke="#E8E2D0" strokeOpacity="0.18" strokeWidth="0.6" />
              <path d="M12 52 L18 34 L22 30 L32 28 L42 30 L46 34 L52 52" fill="#0f1117" stroke="#E8E2D0" strokeOpacity="0.22" strokeWidth="0.7" />
              <path d="M22 30 L32 40 L42 30" stroke="#FFC857" strokeOpacity="0.85" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M32 40 L32 50" stroke="#FFC857" strokeOpacity="0.85" strokeWidth="1.2" />
            </svg>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-[#07090e] border border-[#E8E2D0]/15 text-[6px] tracking-[0.2em] opacity-60">FM</div>
        </div>
      </div>

      {/* The Architect's Dossier Modal */}
      {dossierOpen && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="relative w-full max-w-md bg-[#0A0C14] border border-[#E8E2D0]/30 p-6 md:p-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#E8E6E1]/10 pb-4">
              <span className="font-serif text-[15px] tracking-[0.2em] text-[#E8E6E1]">FORGE MASTER’S DOSSIER</span>
              <button onClick={() => setDossierOpen(false)} className="text-[12px] text-[#E8E6E1]/50 hover:text-[#FFC857]">×</button>
            </div>

            <div className="my-6 space-y-5">
              <div>
                <span className="text-[7.5px] tracking-[0.2em] text-[#E8E6E1]/40 block mb-2 uppercase">Atelier Palette (Themes)</span>
                <div className="grid grid-cols-3 gap-2">
                  {["shadow", "forge", "codex"].map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveTheme(t)}
                      className={`text-[8px] py-2 border tracking-[0.14em] uppercase transition-colors ${activeTheme === t ? "border-[#FFC857] text-[#FFC857]" : "border-[#E8E6E1]/20 text-[#E8E6E1]/50"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-[#E8E6E1]/10">
                <span className="text-[8px] tracking-[0.18em] text-[#E8E6E1]/70 uppercase">Ambient Acoustics</span>
                <button onClick={() => setSoundMuted(!soundMuted)} className="text-[8px] tracking-[0.18em] text-[#FFC857] hover:underline">
                  {soundMuted ? "MUTED" : "RESONANT"}
                </button>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-[#E8E6E1]/10">
                <span className="text-[8px] tracking-[0.18em] text-[#E8E6E1]/70 uppercase">Universal Induction (34s)</span>
                <button onClick={() => { setDossierOpen(false); if (onReplayIntro) onReplayIntro(); }} className="text-[8px] tracking-[0.18em] text-[#FFC857] hover:underline">
                  REPLAY →
                </button>
              </div>

              <div className="pt-4 border-t border-[#E8E6E1]/10 flex justify-between items-center">
                <span className="text-[7.5px] text-[#E8E6E1]/30">IDENT: ENROLLED APPRENTICE</span>
                <button onClick={() => { if (onLogout) onLogout(); setDossierOpen(false); }} className="text-[8px] tracking-[0.16em] text-red-400 hover:text-red-300">
                  DISCONNECT FORGE [LOGOUT]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
