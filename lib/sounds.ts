let context: AudioContext | null = null;

type Tone = {
  type?: OscillatorType;
  frequencies: { frequency: number; time: number }[];
  gain: { start: number; peak?: number; peakTime?: number; end: number };
  duration: number;
};

const KEY_FREQUENCIES: Record<string, number[]> = {
  ArrowUp: [554.37, 659.25],
  ArrowDown: [493.88, 587.33],
  ArrowLeft: [440.0, 523.25],
  ArrowRight: [587.33, 698.46],
  b: [392.0, 493.88],
  a: [440.0, 554.37],
  backspace: [330.0, 293.66],
};

const CLICK_TONES = [
  523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5, 1174.66, 1318.51,
];

function getContext() {
  if (!context) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    context = new AudioContextClass();
  }
  return context;
}

export function setupAudio() {
  const init = () => {
    const audio = getContext();
    if (audio.state === "suspended") audio.resume().catch(() => {});
  };
  const events = ["click", "touchstart", "keydown"] as const;

  events.forEach((event) => document.addEventListener(event, init, { once: true }));
  return () => events.forEach((event) => document.removeEventListener(event, init));
}

function playTone({ type = "sine", frequencies, gain, duration }: Tone) {
  if (!context || context.state !== "running") return;

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const now = context.currentTime;

  oscillator.type = type;
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  frequencies.forEach(({ frequency, time }) => oscillator.frequency.setValueAtTime(frequency, now + time));

  gainNode.gain.setValueAtTime(gain.start, now);
  if (gain.peak !== undefined) {
    gainNode.gain.linearRampToValueAtTime(gain.peak, now + (gain.peakTime ?? 0));
  }
  gainNode.gain.exponentialRampToValueAtTime(gain.end, now + duration);

  oscillator.start(now);
  oscillator.stop(now + duration);

  window.setTimeout(
    () => {
      oscillator.disconnect();
      gainNode.disconnect();
    },
    duration * 1000 + 100,
  );
}

export function playKonamiSound(clickCount: number) {
  playTone({
    frequencies: [{ frequency: CLICK_TONES[(clickCount - 1) % CLICK_TONES.length], time: 0 }],
    gain: { start: 0.1, end: 0.01 },
    duration: 0.3,
  });
}

export function playSuccessSound() {
  playTone({
    frequencies: [
      { frequency: 523.25, time: 0 },
      { frequency: 659.25, time: 0.15 },
      { frequency: 783.99, time: 0.3 },
    ],
    gain: { start: 0.15, end: 0.01 },
    duration: 0.5,
  });
}

export function playErrorSound() {
  playTone({
    type: "sawtooth",
    frequencies: [
      { frequency: 220.0, time: 0 },
      { frequency: 174.61, time: 0.1 },
    ],
    gain: { start: 0.1, end: 0.01 },
    duration: 0.3,
  });
}

export function playKonamiKeySound(key: string, position: number) {
  const frequencies = KEY_FREQUENCIES[key];
  if (!frequencies || !context) return;

  const play = () => {
    const frequency = frequencies[position % frequencies.length];
    playTone({
      frequencies: [{ frequency: frequency * (0.998 + Math.random() * 0.004), time: 0 }],
      gain: { start: 0, peak: 0.2, peakTime: 0.03, end: 0.001 },
      duration: 0.12 + position * 0.008,
    });
  };

  if (context.state === "running") {
    play();
    return;
  }

  context
    .resume()
    .then(play)
    .catch(() => navigator.vibrate?.(50));
}

export function warmAudioContext() {
  const audio = getContext();

  if (audio.state === "suspended") audio.resume().catch(() => {});

  try {
    const oscillator = audio.createOscillator();
    const gainNode = audio.createGain();
    gainNode.gain.value = 0;
    oscillator.connect(gainNode);
    gainNode.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.001);
  } catch {}
}
