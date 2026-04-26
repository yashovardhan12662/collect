import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { dummyTracks, Track } from '../lib/audioGenerator';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const [audioCtxEnabled, setAudioCtxEnabled] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const stopCurrentTrackRef = useRef<(() => void) | null>(null);
  const trackStartTimeRef = useRef<number>(0);
  const progressIntervalRef = useRef<number | null>(null);

  const currentTrack = dummyTracks[currentTrackIndex];

  // Initialize Audio Context on first interaction
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new Ctx();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);
      setAudioCtxEnabled(true);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = muted ? 0 : 0.8;
    }
  }, [muted]);

  useEffect(() => {
    if (isPlaying && audioCtxEnabled && audioCtxRef.current && masterGainRef.current) {
      // Stop previous
      if (stopCurrentTrackRef.current) {
        stopCurrentTrackRef.current();
      }
      
      trackStartTimeRef.current = Date.now();
      setProgress(0);
      
      const stopFn = currentTrack.play(audioCtxRef.current, masterGainRef.current);
      stopCurrentTrackRef.current = stopFn;

      progressIntervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - trackStartTimeRef.current;
        setProgress((elapsed / currentTrack.durationMs) * 100);
        if (elapsed >= currentTrack.durationMs) {
          handleNext();
        }
      }, 1000);
    } else {
      if (stopCurrentTrackRef.current) {
        stopCurrentTrackRef.current();
        stopCurrentTrackRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (stopCurrentTrackRef.current) {
        stopCurrentTrackRef.current();
        stopCurrentTrackRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, currentTrackIndex, audioCtxEnabled]);

  const togglePlay = () => {
    if (!audioCtxEnabled) {
      initAudio();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % dummyTracks.length);
    if (!isPlaying) togglePlay();
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + dummyTracks.length) % dummyTracks.length);
    if (!isPlaying) togglePlay();
  };

  return (
    <div className="bg-black/60 backdrop-blur-xl border border-fuchsia-500/30 rounded-2xl p-4 sm:p-6 w-full shadow-[0_0_15px_rgba(217,70,239,0.15)] flex flex-col md:flex-row items-center gap-4 transition-all">
      {/* Vinyl/Cover Art Mock */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-900 border border-fuchsia-500/50 shadow-[0_0_10px_rgba(217,70,239,0.3)] shrink-0 flex items-center justify-center">
        <div className={`absolute inset-0 bg-gradient-to-tr from-fuchsia-600/40 to-cyan-500/40 opacity-50 ${isPlaying ? 'animate-pulse' : ''}`} />
        <div className={`w-8 h-8 rounded-full border-4 border-black bg-zinc-800 ${isPlaying ? 'animate-[spin_3s_linear_infinite]' : ''}`} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2 w-full text-center md:text-left">
        {/* Track Info */}
        <div className="min-w-0">
          <h3 className="text-white font-bold truncate tracking-wide text-sm sm:text-base drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
            {currentTrack.title}
          </h3>
          <p className="text-cyan-400 text-xs sm:text-sm truncate opacity-80 uppercase tracking-widest font-mono">
            {currentTrack.artist}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden shrink-0 mt-1">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(217,70,239,0.8)]"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0 mt-2 md:mt-0">
        <button 
          onClick={handlePrev}
          className="text-zinc-400 hover:text-cyan-400 transition-colors p-2 rounded-full hover:bg-white/5 active:scale-95"
        >
          <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        
        <button 
          onClick={togglePlay}
          className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-full p-3 sm:p-4 transition-all shadow-[0_0_15px_rgba(217,70,239,0.5)] hover:shadow-[0_0_25px_rgba(217,70,239,0.8)] hover:scale-105 active:scale-95"
        >
          {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" className="ml-1" />}
        </button>

        <button 
          onClick={handleNext}
          className="text-zinc-400 hover:text-cyan-400 transition-colors p-2 rounded-full hover:bg-white/5 active:scale-95"
        >
          <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="w-px h-8 bg-zinc-800 mx-1 sm:mx-2" />

        <button 
          onClick={() => setMuted(!muted)}
          className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
