

import React, { useState, useRef } from 'react';
import { signInWithMagicLink } from '../lib/supabase';

export default function Enrolment({ onBackToGates, onSuccess }) {
  const [email, setEmail] = useState("");
  const [transmitting, setTransmitting] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const hasValue = email.length > 0 && !sealed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || transmitting || sealed) return;
    setTransmitting(true);

    try {
      await signInWithMagicLink(email);
      setTimeout(() => {
        setTransmitting(false);
        setSealed(true);
        if (onSuccess) {
          setTimeout(() => onSuccess(email), 1800);
        }
      }, 1400);
    } catch (err) {
      setTransmitting(false);
    }
  };

  const handleReset = () => {
    setSealed(false);
    setEmail("");
    setTransmitting(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-clip bg-[#07090E] text-[#E8E6E1] font-mono selection:bg-[#FFC857] selection:text-black">
      <style>{`
        @keyframes pulse-amber {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(255, 200, 87, 0.5); }
          50% { opacity: 0.6; box-shadow: 0 0 12px 2px rgba(255, 200, 87, 0.35); }
        }
        @keyframes glow-breath {
          0%, 100% { opacity: 0.18; transform: scale(1); }
          50% { opacity: 0.32; transform: scale(1.08); }
        }
        @keyframes beacon-core {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.25); }
        }
      `}</style>
      
      {/* Background Blueprint Grid */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-60 md:opacity-100"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(232,230,225,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(232,230,225,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }}
      />

      {/* Central Beacon Core Glow */}
      <div className="pointer-events-none absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2">
        <div 
          className="rounded-full w-[360px] h-[360px] md:w-[520px] md:h-[520px]"
          style={{
            background: "radial-gradient(circle, rgba(255,200,87,0.10) 0%, rgba(255,200,87,0.04) 32%, transparent 72%)",
            filter: "blur(1px)",
            animation: "glow-breath 4.2s ease-in-out infinite"
          }}
        />
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-[3px] h-[3px]"
          style={{
            background: "#FFC857",
            boxShadow: "0 0 18px 4px rgba(255,200,87,0.9), 0 0 40px 12px rgba(255,200,87,0.25)",
            animation: "beacon-core 2.6s ease-in-out infinite"
          }}
        />
      </div>

      {/* Desktop CAD Margin Guides */}
      <div className="pointer-events-none hidden md:block absolute left-[2.2vw] top-[18%] bottom-[14%] w-[1px] bg-[#E8E6E1]/10" />
      <div className="pointer-events-none hidden md:block absolute left-[2.2vw] top-[18%] text-[8px] leading-[10px] tracking-[0.18em] text-[#E8E6E1] opacity-[0.28]">
        <div>COORD // 07.090E - CITADEL GRID</div>
        <div className="mt-24 opacity-60">X: 480.00</div>
        <div className="opacity-60">Y: ENROL</div>
        <div className="mt-12 opacity-40">— — — — —</div>
      </div>

      <div className="pointer-events-none hidden md:block absolute right-[2.2vw] top-[18%] bottom-[14%] w-[1px] bg-[#E8E6E1]/10" />
      <div className="pointer-events-none hidden md:block absolute right-[2.2vw] top-[18%] text-right text-[8px] leading-[10px] tracking-[0.18em] text-[#E8E6E1] opacity-[0.28]">
        <div>REF // KEY-01</div>
        <div className="mt-24 opacity-60">SEAL: READY</div>
        <div className="opacity-60">VAULT: CLOSED</div>
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full flex items-start justify-between px-5 md:px-7 pt-6 md:pt-7">
        <button 
          onClick={onBackToGates} 
          className="text-[8px] md:text-[9px] tracking-[0.2em] text-[#E8E6E1]/50 hover:text-[#FFC857] transition-colors border border-[#E8E6E1]/15 bg-[#07090E]/60 px-3 py-1.5 backdrop-blur-sm"
        >
          ← THE GATES
        </button>
        <div className="text-[8px] tracking-[0.16em] leading-[11px] text-right opacity-[0.55] select-none text-[#E8E6E1]">
          <div>SECURE // RLS ACTIVE // JWT // HTTPONLY</div>
          <div className="mt-[2px] opacity-60">CITADEL ENGINE: ENCRYPTED</div>
        </div>
      </header>

      {/* Academy Emblem Header */}
      <div className="relative z-10 mt-6 md:mt-8 flex flex-col items-center justify-center select-none">
        <div className="relative flex flex-col items-center">
          <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 rounded-full border w-14 h-14 border-[#E8E6E1]/10 opacity-70" />
          <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 rounded-full w-10 h-10 border border-[#FFC857]/20 shadow-[0_0_20px_rgba(255,200,87,0.12)] opacity-60" />
          <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FFC857] shadow-[0_0_8px_#FFC857]" />
          <svg width="20" height="28" viewBox="0 0 20 28" fill="none" className="opacity-[0.85]">
            <path d="M10 0L11.2 10.5H12.8L10 28L7.2 10.5H8.8L10 0Z" fill="#E8E6E1" fillOpacity="0.9" />
            <path d="M10 4L10.6 10H11.2L10 18L8.8 10H9.4L10 4Z" fill="#FFC857" fillOpacity="0.9" />
          </svg>
        </div>
        <div className="mt-4 text-center tracking-[0.38em] font-medium text-[11px] text-[#E8E6E1] opacity-70 font-serif">
          SHADOWFORGE ACADEMY
        </div>
        <div className="mt-[3px] text-[8px] tracking-[0.22em] opacity-[0.35]">
          EST. FIRST LIGHT // CITADEL PROTOCOL
        </div>
      </div>

      {/* Mechanical Enrolment Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 md:py-12 my-auto">
        <div className="relative w-full max-w-[420px] md:max-w-[480px]">
          <div 
            className="relative bg-[#07090E]/85 backdrop-blur-[2px] p-6 md:p-8"
            style={{
              border: `1px solid ${focused || hasValue || transmitting || sealed ? "#FFC857" : "rgba(232,230,225,0.60)"}`,
              boxShadow: focused || hasValue 
                ? "0 0 0 1px rgba(255,200,87,0.18), 0 0 36px rgba(255,200,87,0.10)" 
                : sealed 
                ? "0 0 0 1px rgba(255,200,87,0.25), 0 0 44px rgba(255,200,87,0.14)" 
                : "0 0 0 1px rgba(232,230,225,0.04), inset 0 0 80px rgba(232,230,225,0.02)",
              transition: "border-color 0.4s ease, box-shadow 0.4s ease"
            }}
          >
            {/* 4 Corner Vault Seals (Mechanical Rotating Brackets) */}
            <div className="absolute -top-[5px] -left-[5px] w-[10px] h-[10px] border bg-[#07090E] flex items-center justify-center" style={{ borderColor: sealed || transmitting ? "#FFC857" : "rgba(232,230,225,0.45)" }}>
              <div className="w-[4px] h-[1px]" style={{ transform: sealed ? "rotate(90deg)" : transmitting ? "rotate(45deg)" : "rotate(0deg)", background: sealed ? "#FFC857" : "#E8E6E1", transition: "transform 0.8s cubic-bezier(0.77,0,0.175,1)" }} />
            </div>
            <div className="absolute -top-[5px] -right-[5px] w-[10px] h-[10px] border bg-[#07090E] flex items-center justify-center" style={{ borderColor: sealed || transmitting ? "#FFC857" : "rgba(232,230,225,0.45)" }}>
              <div className="w-[4px] h-[1px]" style={{ transform: sealed ? "rotate(90deg)" : transmitting ? "rotate(-45deg)" : "rotate(90deg)", background: sealed ? "#FFC857" : "#E8E6E1", transition: "transform 0.8s cubic-bezier(0.77,0,0.175,1)" }} />
            </div>
            <div className="absolute -bottom-[5px] -left-[5px] w-[10px] h-[10px] border bg-[#07090E] flex items-center justify-center" style={{ borderColor: sealed || transmitting ? "#FFC857" : "rgba(232,230,225,0.45)" }}>
              <div className="w-[4px] h-[1px]" style={{ transform: sealed ? "rotate(90deg)" : transmitting ? "rotate(45deg)" : "rotate(0deg)", background: sealed ? "#FFC857" : "#E8E6E1", transition: "transform 0.8s cubic-bezier(0.77,0,0.175,1)" }} />
            </div>
            <div className="absolute -bottom-[5px] -right-[5px] w-[10px] h-[10px] border bg-[#07090E] flex items-center justify-center" style={{ borderColor: sealed || transmitting ? "#FFC857" : "rgba(232,230,225,0.45)" }}>
              <div className="w-[4px] h-[1px]" style={{ transform: sealed ? "rotate(90deg)" : transmitting ? "rotate(-45deg)" : "rotate(90deg)", background: sealed ? "#FFC857" : "#E8E6E1", transition: "transform 0.8s cubic-bezier(0.77,0,0.175,1)" }} />
            </div>

            {/* Sub-Header Status */}
            <div className="pb-3 border-b flex items-center justify-between border-[#E8E6E1]/10">
              <div className="text-[10px] tracking-[0.14em] opacity-70 text-[#E8E6E1]">
                ACCESS KEY TERMINAL // PROTOCOL: KEY-01 // STATUS:{" "}
                <span style={{ color: sealed ? "#FFC857" : transmitting ? "#FFC857" : "#E8E6E1", opacity: transmitting || sealed ? 1 : 0.9 }}>
                  {sealed ? "SEALED" : transmitting ? "TRANSMITTING" : "AWAITING IDENT"}
                </span>
              </div>
              <div className="flex items-center gap-[3px]">
                <div className="w-[3px] h-[3px] rounded-full" style={{ background: sealed || transmitting ? "#FFC857" : "rgba(232,230,225,0.35)", boxShadow: transmitting || sealed ? "0 0 6px #FFC857" : void 0 }} />
                <div className="w-[3px] h-[3px] rounded-full bg-[#E8E6E1]/20" />
                <div className="w-[3px] h-[3px] rounded-full bg-[#E8E6E1]/20" />
              </div>
            </div>

            {/* Entry Form */}
            <div className="pt-6">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[18px] tracking-[0.18em] font-medium font-serif text-[#E8E6E1]">
                  FORGE ENTRY
                </h2>
                <div className="text-[8px] tracking-[0.18em] opacity-40">VAULT-01</div>
              </div>

              <div className="mt-4 h-[1px] w-full bg-gradient-to-r from-transparent via-[#E8E6E1]/20 to-transparent" />

              <form onSubmit={handleSubmit} className="mt-6">
                <div>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => { if (!sealed) setEmail(e.target.value); }}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      placeholder="// IDENT — ENTER EMAIL FOR ACCESS KEY"
                      className="w-full h-[46px] px-4 pr-10 bg-transparent outline-none border text-[13px] md:text-[14px] tracking-[0.04em] transition-colors duration-300"
                      style={{
                        color: "#E8E6E1",
                        borderColor: focused ? "#FFC857" : "rgba(232,230,225,0.22)",
                        caretColor: "#FFC857"
                      }}
                      disabled={transmitting || sealed}
                    />
                    {focused && !sealed && (
                      <div className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 w-[8px] h-[14px] bg-[#FFC857] opacity-90 shadow-[0_0_10px_#FFC857] animate-pulse" />
                    )}
                    {sealed && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 border border-[#FFC857] bg-[#FFC857]/10 flex items-center justify-center">
                        <span style={{ color: "#FFC857", fontSize: 10 }}>✓</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-[10px] text-[9px] tracking-[0.08em] leading-[13px] flex items-start gap-2 text-[#E8E6E1]/50">
                    <span className="text-[#FFC857]">•</span>
                    <span>Single-use forge key expires in 15 min — sent to your inbox. No password stored.</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={transmitting || sealed || !email}
                    className="group relative w-full h-[48px] border text-[12px] tracking-[0.22em] font-medium overflow-hidden transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed font-serif"
                    style={{
                      borderColor: sealed ? "#FFC857" : transmitting ? "rgba(255,200,87,0.6)" : "rgba(232,230,225,0.70)",
                      color: sealed || transmitting ? "#FFC857" : "#E8E6E1",
                      background: sealed ? "rgba(255,200,87,0.08)" : transmitting ? "rgba(255,200,87,0.06)" : "transparent"
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {transmitting ? (
                        <>
                          <span className="inline-block w-3 h-3 border border-[#FFC857] border-t-transparent rounded-full animate-spin" />
                          TRANSMITTING KEY...
                        </>
                      ) : sealed ? (
                        "— KEY DISPATCHED — CHECK INBOX —"
                      ) : (
                        "DISPATCH ACCESS KEY"
                      )}
                    </span>
                  </button>

                  {sealed && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-[8px] tracking-[0.18em] flex items-center gap-2 text-[#FFC857]">
                        <span className="inline-block w-3.5 h-[1px] bg-[#FFC857] opacity-60" />
                        CLANG-SEAL // HATCH SECURED // NO REPLAY
                        <span className="inline-block w-3.5 h-[1px] bg-[#FFC857] opacity-60" />
                      </div>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-[8px] tracking-[0.16em] opacity-40 hover:opacity-80 transition-opacity underline underline-offset-4"
                      >
                        RESET
                      </button>
                    </div>
                  )}
                </div>
              </form>

              <div className="mt-8 pt-4 border-t border-[#E8E6E1]/10 flex items-center justify-between text-[8px] md:text-[9px] tracking-[0.12em] opacity-40">
                <div>First induction compulsory on first launch — 34s</div>
                <div className="flex items-center gap-1 opacity-30">
                  <div className="w-4 h-[1px] bg-[#E8E6E1]" />
                  <div className="w-[1px] h-2 bg-[#E8E6E1]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sub-Footer */}
      <footer className="relative z-10 w-full mt-auto pb-6 md:pb-7 pt-4">
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-[8px] md:text-[9px] tracking-[0.16em] opacity-[0.42] text-center px-4">
          <span>COORDINATE: ENROLMENT</span>
          <span className="hidden md:inline opacity-30">—</span>
          <span>CITADEL ENGINE: ACTIVE</span>
          <span className="hidden md:inline opacity-30">—</span>
          <span>PROTOCOL: MAGIC-LINK SECURE</span>
          <span className="hidden md:inline opacity-30">—</span>
          <span>RATE LIMIT: 3 / 15MIN</span>
        </div>
      </footer>
    </div>
  );
}

