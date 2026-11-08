import React, { useState } from 'react';
import Gates from './components/Gates';
import Enrolment from './components/Enrolment';
import IntroModal from './components/IntroModal';
import Atelier from './components/Atelier';
import RoadmapPlate from './components/RoadmapPlate';
import MindForgeActOne from './components/MindForgeActOne';

export default function App() {
  // Screens: 'gates' | 'enrolment' | 'atelier' | 'roadmap' | 'mindforge'
  const [currentScreen, setCurrentScreen] = useState('gates');
  const [showIntro, setShowIntro] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [toast, setToast] = useState(null);
  const [actState, setActState] = useState({ 1: 'active', 2: 'locked', 3: 'locked' });

  const handleEnrolSuccess = (email) => {
    setUserEmail(email);
    setCurrentScreen('atelier');
    setShowIntro(true); // Plays 34s Induction on first launch
  };

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  };

  return (
    <div className="min-h-screen w-full bg-[#07090E] text-[#E8E6E1] selection:bg-[#FFC857] selection:text-black font-mono">
      {currentScreen === 'gates' && (
        <Gates onEnterForge={() => setCurrentScreen('enrolment')} />
      )}

      {currentScreen === 'enrolment' && (
        <Enrolment 
          onBackToGates={() => setCurrentScreen('gates')}
          onSuccess={handleEnrolSuccess}
        />
      )}

      {currentScreen === 'atelier' && (
        <Atelier 
          onOpenRoadmap={() => setCurrentScreen('roadmap')}
          onLogout={() => setCurrentScreen('gates')}
          onReplayIntro={() => setShowIntro(true)}
        />
      )}

      {currentScreen === 'roadmap' && (
        <RoadmapPlate 
          onBackToAtelier={() => setCurrentScreen('atelier')}
          onEnterMindForge={() => setCurrentScreen('mindforge')}
          actStatus={actState}
        />
      )}

      {currentScreen === 'mindforge' && (
        <MindForgeActOne
          onExit={() => setCurrentScreen('roadmap')}
          onComplete={(payload) => {
            setActState((prev) => ({ ...prev, 1: 'mastered', 2: 'active' }));
            showToast(`Trial 01 welded at ${payload.height}. Act II loadpath unsealed.`);
            setCurrentScreen('roadmap');
          }}
          onToast={showToast}
        />
      )}

      {/* Host-level toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-[440px] border border-[#FFC857]/50 bg-[#07090E]/95 backdrop-blur px-4 py-2.5 text-center font-mono text-[8px] tracking-[0.18em] text-[#FFC857]">
          {toast}
        </div>
      )}

      <IntroModal 
        isOpen={showIntro} 
        onClose={() => setShowIntro(false)} 
      />
    </div>
  );
}
