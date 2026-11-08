import React, { useState } from 'react';

export default function IntroModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-[390px] aspect-[9/16] border border-[#E8E6E1]/20 bg-[#07090E] flex flex-col justify-between p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#E8E6E1]/10 pb-3">
          <span className="font-mono text-[7.5px] tracking-[0.24em] text-[#00E5FF]">UNIVERSAL INDUCTION PROTOCOL</span>
          <button
            onClick={onClose}
            className="font-mono text-[8px] tracking-[0.18em] border border-[#E8E6E1]/30 px-2 py-0.5 text-[#E8E6E1]/60 hover:text-[#FFC857] hover:border-[#FFC857] transition-all"
          >
            SKIP [×]
          </button>
        </div>

        {/* Video / Content Display Slot */}
        <div className="flex flex-col items-center text-center my-auto">
          <div className="w-16 h-16 rounded-full border border-[#FFC857]/40 flex items-center justify-center animate-pulse">
            <div className="w-3 h-3 rounded-full bg-[#FFC857]" />
          </div>
          <h2 className="font-serif text-[16px] tracking-[0.2em] text-[#E8E6E1] mt-6 font-light">
            THE ARCHITECT’S INDUCTION
          </h2>
          <p className="font-mono text-[8px] tracking-[0.16em] text-[#E8E6E1]/50 mt-3 max-w-[260px] leading-relaxed">
            "Flesh is fragile. One cold mistake... and you become dust. Yet from the dirt... you dare to weave lightning."
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full h-11 border border-[#FFC857]/70 font-serif text-[10px] tracking-[0.24em] text-[#FFC857] hover:bg-[#FFC857]/10 transition-all font-medium"
        >
          ENTER THE ATELIER →
        </button>
      </div>
    </div>
  );
}
