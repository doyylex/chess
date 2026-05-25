(function () {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    window.ChessSounds = {
      play() {},
      unlock() {},
    };
    return;
  }

  let audioContext = null;
  let unlocked = false;
  const masterGainValue = 0.16;

  function getContext() {
    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    return audioContext;
  }

  function unlock() {
    const context = getContext();

    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    unlocked = true;
  }

  function scheduleTone({ delay = 0, duration = 0.08, frequency, gain, type = "sine" }) {
    if (!unlocked) {
      return;
    }

    const context = getContext();
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain * masterGainValue, start + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(envelope);
    envelope.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function play(kind) {
    if (!unlocked) {
      return;
    }

    const presets = {
      move: [
        { frequency: 392, gain: 0.75, duration: 0.055, type: "triangle" },
        { delay: 0.045, frequency: 520, gain: 0.42, duration: 0.055, type: "sine" },
      ],
      capture: [
        { frequency: 180, gain: 0.9, duration: 0.07, type: "triangle" },
        { delay: 0.045, frequency: 260, gain: 0.45, duration: 0.06, type: "sine" },
      ],
      check: [
        { frequency: 660, gain: 0.65, duration: 0.07, type: "sine" },
        { delay: 0.06, frequency: 880, gain: 0.48, duration: 0.08, type: "sine" },
      ],
      promotion: [
        { frequency: 523, gain: 0.58, duration: 0.06, type: "triangle" },
        { delay: 0.055, frequency: 659, gain: 0.5, duration: 0.06, type: "triangle" },
        { delay: 0.11, frequency: 784, gain: 0.42, duration: 0.08, type: "sine" },
      ],
      invalid: [
        { frequency: 130, gain: 0.42, duration: 0.075, type: "sawtooth" },
      ],
      win: [
        { frequency: 392, gain: 0.56, duration: 0.08, type: "triangle" },
        { delay: 0.08, frequency: 523, gain: 0.5, duration: 0.08, type: "triangle" },
        { delay: 0.16, frequency: 659, gain: 0.46, duration: 0.12, type: "sine" },
      ],
      loss: [
        { frequency: 330, gain: 0.44, duration: 0.1, type: "triangle" },
        { delay: 0.1, frequency: 220, gain: 0.38, duration: 0.16, type: "sine" },
      ],
      draw: [
        { frequency: 440, gain: 0.42, duration: 0.08, type: "triangle" },
        { delay: 0.085, frequency: 440, gain: 0.32, duration: 0.1, type: "sine" },
      ],
    };

    (presets[kind] || presets.move).forEach(scheduleTone);
  }

  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });

  window.ChessSounds = {
    play,
    unlock,
  };
})();
