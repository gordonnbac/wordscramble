
// Create a single AudioContext to be reused
let audioContext: AudioContext | null = null;
const getAudioContext = () => {
  if (typeof window !== 'undefined' && !audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// A helper function to play a tone
const playTone = (freq: number, duration: number, type: OscillatorType = 'sine') => {
  try {
    const context = getAudioContext();
    if (!context) return;

    // Resume context if it's suspended (e.g., due to browser auto-play policies)
    if (context.state === 'suspended') {
      context.resume();
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, context.currentTime);

    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + duration);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
  } catch (e) {
    console.error("Could not play sound", e);
  }
};

export const playCorrectSound = () => {
  const context = getAudioContext();
  if (context) {
    playTone(523.25, 0.1, 'sine'); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine'), 100); // E5
  }
};

export const playIncorrectSound = () => {
  playTone(164.81, 0.2, 'square'); // E3
};

export const playGameOverSound = () => {
    const context = getAudioContext();
    if (context) {
        playTone(261.63, 0.15, 'triangle'); // C4
        setTimeout(() => playTone(329.63, 0.15, 'triangle'), 150); // E4
        setTimeout(() => playTone(392.00, 0.15, 'triangle'), 300); // G4
        setTimeout(() => playTone(523.25, 0.3, 'triangle'), 450); // C5
    }
};
