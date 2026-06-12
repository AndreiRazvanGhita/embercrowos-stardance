const ROOT_FREQ = 110; // A2
const PATTERN = [0, 3, 7, 10, 12, 10, 7, 3]; // semitone steps
const STEP_MS = 200;
const NOTE_LENGTH_S = 0.18;

export function createArpeggioSequence(rootFreq, semitoneSteps) {
  return semitoneSteps.map((step) => rootFreq * Math.pow(2, step / 12));
}

export const musicApp = {
  id: 'music',
  title: 'Music',
  icon: '(>)',
  defaultSize: { width: 360, height: 220 },
  createContent(container) {
    container.classList.add('app-music');

    const label = document.createElement('div');
    label.className = 'music-track';
    label.textContent = 'EMBERCROW - signal.wav';

    const canvas = document.createElement('canvas');
    canvas.className = 'music-visualizer';
    canvas.width = 320;
    canvas.height = 80;

    const button = document.createElement('button');
    button.className = 'music-toggle';
    button.textContent = 'play';

    container.append(label, canvas, button);

    const sequence = createArpeggioSequence(ROOT_FREQ, PATTERN);
    const ctx2d = canvas.getContext('2d');

    let audioCtx = null;
    let analyser = null;
    let stepIndex = 0;
    let intervalId = null;
    let rafId = null;
    let playing = false;

    const draw = () => {
      if (!container.isConnected) return;
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      ctx2d.fillStyle = '#0a0a0a';
      ctx2d.fillRect(0, 0, canvas.width, canvas.height);
      ctx2d.fillStyle = '#ff5c2b';
      const barWidth = canvas.width / data.length;
      for (let i = 0; i < data.length; i++) {
        const barHeight = (data[i] / 255) * canvas.height;
        ctx2d.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
      }
      rafId = requestAnimationFrame(draw);
    };

    const playStep = () => {
      if (!container.isConnected) {
        clearInterval(intervalId);
        cancelAnimationFrame(rafId);
        audioCtx.close();
        playing = false;
        return;
      }

      const osc = audioCtx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = sequence[stepIndex % sequence.length];

      const gain = audioCtx.createGain();
      gain.gain.value = 0.1;

      osc.connect(gain);
      gain.connect(analyser);

      osc.start();
      osc.stop(audioCtx.currentTime + NOTE_LENGTH_S);
      stepIndex++;
    };

    button.addEventListener('click', () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.connect(audioCtx.destination);
      }

      playing = !playing;
      button.textContent = playing ? 'pause' : 'play';

      if (playing) {
        playStep();
        intervalId = setInterval(playStep, STEP_MS);
        draw();
      } else {
        clearInterval(intervalId);
        cancelAnimationFrame(rafId);
      }
    });
  },
};
