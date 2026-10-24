let context: AudioContext | null = null;
let muted = false;

/** The keypad and terminal header expose this as a sound toggle. */
export function setSoundMuted(value: boolean) {
  muted = value;
}

export function isSoundMuted() {
  return muted;
}

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

/**
 * Build the audio context ahead of the first click. Creating an AudioContext
 * can take tens of milliseconds on some machines (it opens the output device),
 * which is a visible hitch when it happens inside a click handler. Call this
 * from an idle callback after any user gesture: the page then has user
 * activation, so the context is allowed to start.
 */
export function prepareAudio() {
  try {
    const audio = getContext();
    if (audio.state === "suspended") audio.resume().catch(() => {});
  } catch {
    // no Web Audio: sound is simply off
  }
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
  if (muted || !context || context.state !== "running") return;

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const now = context.currentTime;

  oscillator.type = type;
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  frequencies.forEach(({ frequency, time }) =>
    oscillator.frequency.setValueAtTime(frequency, now + time),
  );

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

export function resumeAudio(): Promise<void> {
  return getContext()
    .resume()
    .then(() => {})
    .catch(() => {});
}

/* ---- Terminal sound design ------------------------------------------------
   Short, soft, synthetic. Everything goes through playTone, so the mute
   toggle and the "audio not unlocked yet" guard apply to all of it. */

/** Create and resume the shared context. Safe to call from any user gesture,
    and from the terminal opening, where the context may not exist yet. */
export function ensureAudio(): Promise<void> {
  try {
    const audio = getContext();
    if (audio.state === "running") return Promise.resolve();
    return audio
      .resume()
      .then(() => {})
      .catch(() => {});
  } catch {
    return Promise.resolve();
  }
}

/** A keystroke: a tiny dry tick, slightly different each time. */
export function playTypeTick(kind: "key" | "back" | "space" = "key") {
  const base = kind === "back" ? 180 : kind === "space" ? 240 : 320;
  playTone({
    type: "square",
    frequencies: [{ frequency: base * (0.92 + Math.random() * 0.16), time: 0 }],
    gain: { start: 0.025, end: 0.0008 },
    duration: 0.035,
  });
}

/** Enter: a firmer two-step click. */
export function playEnterSound() {
  playTone({
    type: "triangle",
    frequencies: [
      { frequency: 260, time: 0 },
      { frequency: 390, time: 0.045 },
    ],
    gain: { start: 0.06, end: 0.002 },
    duration: 0.11,
  });
}

/** Terminal opening: a rising power-on sweep with a soft chord tail. */
export function playBootSound() {
  playTone({
    type: "sawtooth",
    frequencies: [
      { frequency: 90, time: 0 },
      { frequency: 140, time: 0.08 },
      { frequency: 220, time: 0.16 },
      { frequency: 330, time: 0.24 },
    ],
    gain: { start: 0, peak: 0.05, peakTime: 0.1, end: 0.001 },
    duration: 0.42,
  });
  window.setTimeout(() => {
    playTone({
      frequencies: [{ frequency: 659.25, time: 0 }],
      gain: { start: 0, peak: 0.06, peakTime: 0.02, end: 0.001 },
      duration: 0.35,
    });
  }, 320);
}

/** A trophy: a bright three-note sparkle. */
export function playTrophySound() {
  const notes = [880, 1174.66, 1567.98];
  notes.forEach((frequency, index) => {
    window.setTimeout(() => {
      playTone({
        frequencies: [{ frequency, time: 0 }],
        gain: { start: 0, peak: 0.09, peakTime: 0.01, end: 0.001 },
        duration: 0.22,
      });
    }, index * 70);
  });
}

/** A new rank: a rising major arpeggio that lands on a held chord. */
export function playRankUpSound() {
  const run = [523.25, 659.25, 783.99, 1046.5];
  run.forEach((frequency, index) => {
    window.setTimeout(() => {
      playTone({
        type: "triangle",
        frequencies: [{ frequency, time: 0 }],
        gain: { start: 0, peak: 0.11, peakTime: 0.015, end: 0.001 },
        duration: index === run.length - 1 ? 0.7 : 0.2,
      });
    }, index * 110);
  });
  window.setTimeout(() => {
    [659.25, 783.99].forEach((frequency) =>
      playTone({
        frequencies: [{ frequency, time: 0 }],
        gain: { start: 0, peak: 0.06, peakTime: 0.03, end: 0.001 },
        duration: 0.6,
      }),
    );
  }, 330);
}

/** All 21: a full fanfare. Rising run, a held chord, then a high shimmer. */
export function playFinaleSound() {
  const run = [392, 523.25, 659.25, 783.99, 1046.5, 1318.51];
  run.forEach((frequency, index) => {
    window.setTimeout(() => {
      playTone({
        type: "triangle",
        frequencies: [{ frequency, time: 0 }],
        gain: { start: 0, peak: 0.12, peakTime: 0.015, end: 0.001 },
        duration: 0.25,
      });
    }, index * 120);
  });
  window.setTimeout(() => {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency) =>
      playTone({
        type: "triangle",
        frequencies: [{ frequency, time: 0 }],
        gain: { start: 0, peak: 0.08, peakTime: 0.04, end: 0.001 },
        duration: 1.6,
      }),
    );
  }, 780);
  [2093, 2637, 3136, 2637, 3136, 4186].forEach((frequency, index) => {
    window.setTimeout(
      () =>
        playTone({
          frequencies: [{ frequency, time: 0 }],
          gain: { start: 0, peak: 0.04, peakTime: 0.005, end: 0.0005 },
          duration: 0.18,
        }),
      1100 + index * 90,
    );
  });
}

/** Switching theme or toggling a setting: one soft blip. */
export function playBlipSound() {
  playTone({
    frequencies: [
      { frequency: 520, time: 0 },
      { frequency: 780, time: 0.05 },
    ],
    gain: { start: 0, peak: 0.05, peakTime: 0.01, end: 0.001 },
    duration: 0.12,
  });
}

/** Coffee: grinder rattle, a rising heat hum, bubbling pour, then a bell.
    Timed to the phases in components/easter-egg/CoffeeBrew.tsx. */
export function playBrewSound() {
  const later = (ms: number, run: () => void) => window.setTimeout(run, ms);

  for (let i = 0; i < 7; i++) {
    later(i * 90, () =>
      playTone({
        type: "sawtooth",
        frequencies: [{ frequency: 110 + (i % 3) * 18, time: 0 }],
        gain: { start: 0.03, end: 0.001 },
        duration: 0.07,
      }),
    );
  }

  later(700, () =>
    playTone({
      frequencies: [
        { frequency: 220, time: 0 },
        { frequency: 520, time: 0.7 },
      ],
      gain: { start: 0, peak: 0.035, peakTime: 0.3, end: 0.001 },
      duration: 0.8,
    }),
  );

  for (let ms = 1500; ms < 3700; ms += 110) {
    later(ms, () => {
      const base = 300 + Math.random() * 500;
      playTone({
        frequencies: [
          { frequency: base, time: 0 },
          { frequency: base * 1.6, time: 0.05 },
        ],
        gain: { start: 0, peak: 0.03, peakTime: 0.01, end: 0.001 },
        duration: 0.08,
      });
    });
  }

  [880, 1318.51].forEach((frequency, index) =>
    later(3900 + index * 110, () =>
      playTone({
        type: "triangle",
        frequencies: [{ frequency, time: 0 }],
        gain: { start: 0, peak: 0.09, peakTime: 0.01, end: 0.001 },
        duration: 0.5,
      }),
    ),
  );
}

/** Matrix: a rising drone, scattered data chirps, a falling glitch sweep when
    the line decodes, then a low thud. Timed to MATRIX_SEQUENCE. */
export function playMatrixSound() {
  const later = (ms: number, run: () => void) => window.setTimeout(run, ms);

  playTone({
    type: "sawtooth",
    frequencies: [
      { frequency: 55, time: 0 },
      { frequency: 110, time: 1.4 },
    ],
    gain: { start: 0, peak: 0.03, peakTime: 0.6, end: 0.001 },
    duration: 2.2,
  });

  for (let i = 0; i < 26; i++) {
    later(300 + Math.random() * 4700, () =>
      playTone({
        type: "square",
        frequencies: [{ frequency: 600 + Math.random() * 1400, time: 0 }],
        gain: { start: 0.018, end: 0.0008 },
        duration: 0.04,
      }),
    );
  }

  later(5200, () =>
    playTone({
      type: "sawtooth",
      frequencies: [
        { frequency: 900, time: 0 },
        { frequency: 80, time: 0.5 },
      ],
      gain: { start: 0.05, end: 0.001 },
      duration: 0.7,
    }),
  );

  later(6900, () => {
    playTone({
      frequencies: [
        { frequency: 90, time: 0 },
        { frequency: 45, time: 0.5 },
      ],
      gain: { start: 0, peak: 0.16, peakTime: 0.02, end: 0.001 },
      duration: 0.8,
    });
    [659.25, 987.77].forEach((frequency, index) =>
      later(120 + index * 100, () =>
        playTone({
          type: "triangle",
          frequencies: [{ frequency, time: 0 }],
          gain: { start: 0, peak: 0.05, peakTime: 0.01, end: 0.001 },
          duration: 0.4,
        }),
      ),
    );
  });
}

/** Hack: frantic typing, a scanner sweep, a bright "granted" chime, quick
    download blips. The error buzz at the end is playErrorSound, fired by the
    terminal. Timed to HACK_SEQUENCE. */
export function playHackSound() {
  const later = (ms: number, run: () => void) => window.setTimeout(run, ms);

  for (let ms = 0; ms < 3800; ms += 55 + Math.random() * 45) {
    later(ms, () =>
      playTone({
        type: "square",
        frequencies: [{ frequency: 260 + Math.random() * 200, time: 0 }],
        gain: { start: 0.02, end: 0.0008 },
        duration: 0.03,
      }),
    );
  }

  later(1400, () =>
    playTone({
      type: "sine",
      frequencies: [
        { frequency: 300, time: 0 },
        { frequency: 1100, time: 1.0 },
      ],
      gain: { start: 0, peak: 0.03, peakTime: 0.2, end: 0.001 },
      duration: 1.1,
    }),
  );

  later(5200, () =>
    [659.25, 987.77, 1318.51].forEach((frequency, index) =>
      later(index * 90, () =>
        playTone({
          type: "triangle",
          frequencies: [{ frequency, time: 0 }],
          gain: { start: 0, peak: 0.09, peakTime: 0.01, end: 0.001 },
          duration: 0.35,
        }),
      ),
    ),
  );

  for (let ms = 5800; ms < 7500; ms += 70) {
    later(ms, () =>
      playTone({
        type: "square",
        frequencies: [{ frequency: 700 + Math.random() * 500, time: 0 }],
        gain: { start: 0.014, end: 0.0008 },
        duration: 0.03,
      }),
    );
  }
}
