/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import MusicPlayer from './components/MusicPlayer';
import SnakeGame from './components/SnakeGame';

export default function App() {
  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white flex flex-col relative overflow-hidden font-sans selection:bg-fuchsia-500/30">
      
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-900/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-900/20 blur-[150px]" />
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      {/* Scanlines */}
      <div className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay opacity-[0.05]"
           style={{ backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 1) 51%)', backgroundSize: '100% 4px' }}
      />

      <main className="flex-1 flex flex-col relative z-20 h-full p-4 sm:p-8 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <header className="w-full flex justify-between items-start mb-4 sm:mb-8 shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse shadow-[0_0_10px_rgba(217,70,239,1)]" />
              Nexus OS
            </h1>
            <p className="text-zinc-500 font-mono text-xs tracking-widest mt-1">v1.2.0.4 - ONLINE</p>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-8 w-full">
          
          {/* Game Region */}
          <div className="flex-1 flex items-center justify-center w-full max-w-2xl mx-auto">
            <SnakeGame />
          </div>

          {/* Side Info / Aesthetic Panel (Visible on larger screens) */}
          <div className="hidden lg:flex flex-col gap-6 w-72 shrink-0 border-l border-zinc-900 pl-8 opacity-80 pt-8 xl:pt-0">
             <div className="flex flex-col gap-2 font-mono text-xs text-zinc-500">
               <div className="flex justify-between border-b border-zinc-900 pb-2">
                 <span>SYS.LOAD</span>
                 <span className="text-cyan-400">42.8%</span>
               </div>
               <div className="flex justify-between border-b border-zinc-900 pb-2">
                 <span>NET.STATUS</span>
                 <span className="text-fuchsia-400">SECURE</span>
               </div>
               <div className="flex justify-between border-b border-zinc-900 pb-2">
                 <span>USR.MODE</span>
                 <span className="text-white">GAMER</span>
               </div>
             </div>
             
             <div className="mt-4 p-4 border border-zinc-800 rounded-lg bg-zinc-900/30 font-mono text-[10px] leading-relaxed text-zinc-600">
               <p className="mb-2">&gt; INITIALIZING SNAKE PROTOCOL...</p>
               <p className="mb-2">&gt; MOUNTING AUDIO DRIVERS...</p>
               <p className="mb-2 text-cyan-500/50">&gt; ALL SYSTEMS NOMINAL.</p>
               <div className="w-2 h-4 bg-fuchsia-500/50 mt-4 animate-pulse" />
             </div>
          </div>
        </div>

        {/* Music Player Footer */}
        <div className="w-full max-w-2xl mx-auto mt-auto pt-6 shrink-0 relative z-30">
          <MusicPlayer />
        </div>

      </main>

    </div>
  );
}
