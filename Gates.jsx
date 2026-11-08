import React, { useState } from 'react';

const SECTORS = [
  { sector: "06", locked: true },
  { sector: "02", locked: true },
  { sector: "03", locked: true },
  { sector: "01", locked: false, lit: true },
  { sector: "04", locked: true },
  { sector: "05", locked: true }
];

export default function Gates({ onEnterForge }) {
  const [hoveredSector, setHoveredSector] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleEnter = () => {
    triggerToast("Access Key Required — Enrolment Terminal");
    if (onEnterForge) {
      setTimeout(() => onEnterForge(), 800);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#07090E] text-[#E8E6E1] flex flex-col justify-between selection:bg-[#FFC857] selection:text-black">
      <style>{`
        @keyframes spark-pulse {
          0%, 100% { transform: scale(1); opacity: 1; filter: blur(0); }
          50% { transform: scale(1.6); opacity: 0.8; filter: blur(0.5px); }
        }
        @keyframes starburst-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes seam-breathe {
          0%, 100% { opacity: 0.9; transform: scaleX(1); filter: blur(0); }
          50% { opacity: 0.4; transform: scaleX(0.96); filter: blur(0.8px); }
        }
        @keyframes seam-leak {
          0% { transform: translateX(-100%); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>

      {/* Blueprint Grid Background */}
      <div className="pointer-events-none absolute inset-0">
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(232,230,225,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(232,230,225,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "96px 96px"
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(232,230,225,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(232,230,225,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px"
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_40%,transparent_0%,transparent_45%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* Spire Header */}
      <header className="relative z-10 flex w-full flex-col items-center pt-16 md:pt-14">
        <div className="relative flex flex-col items-center">
          <svg width="32" height="48" viewBox="0 0 32 48" className="mb-3 opacity-70 fill-none">
            <path d="M16 2 L16 44 M8 18 L16 2 L24 18 M6 44 L26 44 M10 28 L22 28 M12 36 L20 36" stroke="#E8E6E1" strokeWidth="1" strokeLinecap="square" />
            <circle cx="16" cy="2" r="1.5" fill="#FFC857" style={{ animation: "spark-pulse 2.2s infinite" }} />
          </svg>
          <h1 className="text-center text-[11px] font-normal tracking-[0.42em] text-[#E8E6E1]/70 md:text-[13px] md:tracking-[0.52em] uppercase font-serif">
            SHADOWFORGE ACADEMY
          </h1>
          <div className="mono text-[7px] md:text-[8px] tracking-[0.22em] text-[#E8E6E1]/30 mt-1 uppercase">
            EST. FIRST LIGHT // CITADEL PROTOCOL
          </div>
          <div className="mt-3 h-px w-[72px] bg-[#E8E6E1]/20" />
        </div>
      </header>

      {/* Horizon: 6 Citadels */}
      <main className="relative z-10 flex w-full flex-1 flex-col items-center justify-center py-8 md:py-12 my-auto">
        <div className="relative w-full">
          <div className="absolute left-0 right-0 top-[62%] h-px bg-[#E8E6E1]/10 md:top-[58%]" />

          <div className="relative mx-auto flex w-full max-w-[980px] items-end justify-center gap-[6px] px-2 md:gap-[36px] md:px-8">
            {SECTORS.map((s) => {
              const isLit = !!s.lit;
              const isHovered = hoveredSector === s.sector;

              return (
                <button
                  key={s.sector}
                  onMouseEnter={() => setHoveredSector(s.sector)}
                  onMouseLeave={() => setHoveredSector(null)}
                  onClick={() => {
                    if (isLit) handleEnter();
                    else triggerToast(`SECTOR ${s.sector} // SEALED BY THE ARCHITECT`);
                  }}
                  className="group relative flex min-w-0 flex-col items-center focus:outline-none transition-all duration-300"
                  style={{
                    transform: isLit ? "translateY(-4px) scale(1.06)" : isHovered ? "translateY(-2px)" : "none"
                  }}
                >
                  <div className="relative">
                    <svg viewBox="0 0 64 132" className="w-[44px] h-[96px] md:w-[64px] md:h-[132px] overflow-visible fill-none">
                      <path d="M8 116 L56 116 L56 124 L8 124 Z M12 108 L52 108 L52 116 L12 116 Z M14 56 L14 108 L50 108 L50 56 Z M18 36 L18 56 L46 56 L46 36 Z M28 8 L32 0 L36 8 L36 36 L28 36 Z" stroke="#E8E6E1" strokeWidth="1" opacity={isLit ? 1 : isHovered ? 0.6 : 0.25} />
                      <path d="M14 72 L50 72 M14 88 L50 88" stroke="#E8E6E1" strokeWidth="0.7" strokeDasharray="3 3" opacity="0.3" />
                      <path d="M32 0 L32 108" stroke="#E8E6E1" strokeWidth="0.5" opacity="0.3" />

                      {isLit && (
                        <g>
                          <rect x="28" y="64" width="8" height="10" fill="#FFC857" opacity="0.9" style={{ filter: "drop-shadow(0 0 6px #FFC857)" }} />
                          <circle cx="32" cy="0.5" r="2" fill="#FFC857" style={{ animation: "spark-pulse 1.8s infinite" }} />
                        </g>
                      )}
                      {!isLit && <circle cx="32" cy="0.5" r="1" fill="#E8E6E1" opacity="0.5" />}
                    </svg>

                    {s.locked && (
                      <div className="pointer-events-none absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 opacity-50">
                        <svg width="20" height="20" viewBox="0 0 22 22" className="fill-none stroke-[#E8E6E1]">
                          <circle cx="11" cy="11" r="7.5" strokeWidth="1" />
                          <circle cx="11" cy="11" r="3" strokeWidth="0.8" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-center mono text-[6px] md:text-[8.5px] tracking-[0.14em]">
                    {isLit ? (
                      <span className="text-[#FFC857]">SECTOR {s.sector} // OPEN</span>
                    ) : (
                      <span className="opacity-35">// SECTOR {s.sector}: [CLASSIFIED]</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-14 flex flex-col items-center gap-4 md:mt-16">
          <button
            onClick={handleEnter}
            className="group relative border border-[#E8E6E1]/70 bg-[#07090E]/60 px-8 py-3 transition-all duration-500 hover:border-[#FFC857] hover:bg-[#07090E]"
          >
            <span className="serif relative z-10 text-[11px] md:text-[12px] tracking-[0.32em] text-[#E8E6E1] group-hover:text-[#FFC857] transition-colors">
              ENTER THE FORGE
            </span>
            <span className="pointer-events-none absolute -right-1 -top-1 h-1 w-1 bg-[#FFC857] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <div className="mono text-[7px] tracking-[0.3em] opacity-30">FIRST LIGHT CANON</div>
        </div>
      </main>

      {/* Vault Seam Footer */}
      <footer className="relative z-10 mt-auto w-full">
        <div className="relative w-full overflow-hidden border-t border-[#E8E6E1]/10 bg-[#07090E] h-24 md:h-32 flex flex-col justify-center items-center">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[#FFC857]" style={{ animation: "seam-breathe 4s infinite" }}>
            <div className="h-full w-28 bg-gradient-to-r from-transparent via-white to-transparent opacity-80" style={{ animation: "seam-leak 6s infinite" }} />
          </div>
          <div className="relative z-10 mono text-[7.5px] tracking-[0.24em] text-[#E8E6E1]/40 uppercase">
            ARCHIVE VAULT // 1000 BLUEPRINTS CONTAINED
          </div>
        </div>
        <div className="flex w-full items-center justify-between border-t border-[#E8E6E1]/10 px-6 py-2.5 mono text-[7px] text-[#E8E6E1]/30">
          <span>COORDINATE: 0°0'0" // CITADEL ENGINE: ACTIVE</span>
          <span>SHADOWFORGE ACADEMY</span>
        </div>
      </footer>

      {/* HUD Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 pointer-events-none">
          <div className="border border-[#FFC857]/40 bg-[#07090E]/95 px-6 py-2.5 shadow-2xl backdrop-blur-md flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC857] animate-pulse" />
            <span className="mono text-[9px] tracking-[0.18em] text-[#E8E6E1]">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
