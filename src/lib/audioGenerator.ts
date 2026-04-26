export type Track = {
  id: string;
  title: string;
  artist: string;
  durationMs: number;
  play: (ctx: AudioContext, destination: AudioNode) => () => void;
};

// A helper to schedule notes
const scheduleSynth = (
  ctx: AudioContext,
  destination: AudioNode,
  notes: number[],
  noteLength: number,
  type: OscillatorType,
  filterFreq: number
) => {
  let isPlaying = true;
  let nextNoteTime = ctx.currentTime + 0.1;
  let currentNoteIndex = 0;
  let timeoutId: number;

  const playNote = () => {
    if (!isPlaying) return;
    
    while (nextNoteTime < ctx.currentTime + 0.1) {
      const noteOffset = notes[currentNoteIndex];
      if (noteOffset !== null && noteOffset !== undefined) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = type;
        // Base frequency (C3 = 130.81Hz)
        osc.frequency.value = 130.81 * Math.pow(2, noteOffset / 12);
        
        filter.type = 'lowpass';
        filter.frequency.value = filterFreq;
        filter.Q.value = 5;

        // Envelope
        gain.gain.setValueAtTime(0, nextNoteTime);
        gain.gain.linearRampToValueAtTime(0.3, nextNoteTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, nextNoteTime + noteLength * 0.9);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc.start(nextNoteTime);
        osc.stop(nextNoteTime + noteLength);
      }

      nextNoteTime += noteLength;
      currentNoteIndex = (currentNoteIndex + 1) % notes.length;
    }
    timeoutId = window.setTimeout(playNote, 25);
  };

  playNote();

  return () => {
    isPlaying = false;
    clearTimeout(timeoutId);
  };
};

export const dummyTracks: Track[] = [
  {
    id: 'track-1',
    title: 'Neon Nights (Generated)',
    artist: 'AI Studio Synth',
    durationMs: 180000,
    play: (ctx, dest) => {
      // Arpeggio
      const notes = [0, 3, 7, 10, 12, 10, 7, 3, 0, 3, 7, 10, 12, 15, 12, 7]; 
      const stop1 = scheduleSynth(ctx, dest, notes, 0.15, 'sawtooth', 800);
      
      // Bass
      const bassNotes = [0, null, null, null, 0, null, null, null, -4, null, null, null, -2, null, null, null];
      const stop2 = scheduleSynth(ctx, dest, bassNotes, 0.3, 'square', 400);

      const hihat = () => {
          let isPlaying = true;
          let nextNoteTime = ctx.currentTime + 0.1;
          let timeoutId: number;

          const play = () => {
              if(!isPlaying) return;
               while (nextNoteTime < ctx.currentTime + 0.1) {
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  const filter = ctx.createBiquadFilter();
                  
                  osc.type = 'square';
                  osc.frequency.value = Math.random() * 5000 + 5000;
                  
                  filter.type = 'highpass';
                  filter.frequency.value = 7000;
                  
                  gain.gain.setValueAtTime(0, nextNoteTime);
                  gain.gain.linearRampToValueAtTime(0.1, nextNoteTime + 0.01);
                  gain.gain.exponentialRampToValueAtTime(0.01, nextNoteTime + 0.05);

                  osc.connect(filter);
                  filter.connect(gain);
                  gain.connect(dest);

                  osc.start(nextNoteTime);
                  osc.stop(nextNoteTime + 0.05);

                  nextNoteTime += 0.3; // 8th notes based on 0.15 duration of 16ths
               }
               timeoutId = window.setTimeout(play, 25);
          }
          play();
          return () => { isPlaying = false; clearTimeout(timeoutId); }
      }
      const stop3 = hihat();

      return () => { stop1(); stop2(); stop3(); };
    }
  },
  {
    id: 'track-2',
    title: 'Cyberpunk Chase (Generated)',
    artist: 'AI Studio Drums',
    durationMs: 150000,
    play: (ctx, dest) => {
      const notes = [12, null, 15, null, 12, null, 10, null, 12, null, -12, null, 0, 3];
      const stop1 = scheduleSynth(ctx, dest, notes, 0.1, 'square', 1000);
      
      const bassNotes = [-12,-12,-12,-12,-12,-12,-12,-12, -8,-8,-8,-8,-10,-10,-10,-10];
      const stop2 = scheduleSynth(ctx, dest, bassNotes, 0.2, 'sawtooth', 300);

      return () => { stop1(); stop2(); };
    }
  },
  {
    id: 'track-3',
    title: 'Digital Dawn (Generated)',
    artist: 'AI Studio Chiptune',
    durationMs: 120000,
    play: (ctx, dest) => {
      const notes = [7, 10, 14, 19, 14, 10, 7, 3, 7, 10, 14, 19, 21, 19, 14, 10];
      const stop1 = scheduleSynth(ctx, dest, notes, 0.2, 'sine', 2000);
      return () => { stop1(); };
    }
  }
];
