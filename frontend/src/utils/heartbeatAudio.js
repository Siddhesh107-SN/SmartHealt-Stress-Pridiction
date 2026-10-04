/**
 * Web Audio API Heartbeat Tone Generator
 * 
 * Provides a subtle, clinical synthetic heartbeat tone matching current BPM.
 * Safe for all modern browsers: respects user activation and requires explicit toggle.
 */

class HeartbeatAudioController {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.bpm = 60;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playThump(frequency = 70, duration = 0.08, gainVal = 0.12) {
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      // Low pass filter for soft organic clinical sound
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + duration);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(gainVal, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }

  start(bpm = 60) {
    this.initContext();
    this.bpm = bpm;
    this.stop();
    this.isPlaying = true;

    const playCycle = () => {
      if (!this.isPlaying) return;

      if (this.bpm >= 110) {
        // Double-thump for critical rhythm (lub-dub)
        this.playThump(75, 0.07, 0.14);
        setTimeout(() => {
          if (this.isPlaying) this.playThump(55, 0.06, 0.10);
        }, 110);
      } else {
        // Single gentle cardiac blip
        this.playThump(65, 0.09, 0.12);
      }
    };

    // Play initial blip
    playCycle();

    const intervalMs = (60 / this.bpm) * 1000;
    this.intervalId = setInterval(playCycle, intervalMs);
  }

  updateBpm(bpm) {
    if (this.bpm !== bpm) {
      this.bpm = bpm;
      if (this.isPlaying) {
        this.start(bpm);
      }
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  toggle(bpm = 60) {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start(bpm);
      return true;
    }
  }
}

export const heartbeatAudio = new HeartbeatAudioController();
