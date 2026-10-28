/**
 * DStech Call Audio Synthesizer (Web Audio API)
 * Menghasilkan nada dering masuk (incoming ringtone) dan nada panggil keluar (dial tone)
 * secara native tanpa dependensi file eksternal mp3.
 */

class DStechCallAudio {
  private audioCtx: AudioContext | null = null;
  private isRinging: boolean = false;
  private ringInterval: any = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Bunyikan Nada Dering Masuk (Incoming Ringtone)
   * Pola: Dual-tone harmonik (480Hz & 440Hz) berdering 2 detik, jeda 2 detik, berulang.
   */
  public startIncomingRingtone() {
    if (this.isRinging) return;
    this.isRinging = true;

    const playBurst = () => {
      if (!this.isRinging) return;
      const ctx = this.getContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;

        // Tone 1: 440Hz
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(440, now);

        // Tone 2: 480Hz
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(480, now);

        // Envelope bunyi 2 detik lalu fade out
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        gain2.gain.setValueAtTime(0.2, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.8);
        osc2.stop(now + 1.8);
      } catch (e) {
        console.warn("AudioContext play error:", e);
      }
    };

    playBurst();
    this.ringInterval = setInterval(playBurst, 3500);
  }

  /**
   * Bunyikan Nada Sambung Keluar (Outgoing Dial Tone)
   * Pola: Nada 'tuuut... tuuut...' saat memanggil rekan tim.
   */
  public startOutgoingDialtone() {
    if (this.isRinging) return;
    this.isRinging = true;

    const playDialTone = () => {
      if (!this.isRinging) return;
      const ctx = this.getContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(425, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.2);
      } catch (e) {
        console.warn("AudioContext dial tone error:", e);
      }
    };

    playDialTone();
    this.ringInterval = setInterval(playDialTone, 3800);
  }

  /**
   * Hentikan seluruh suara panggilan
   */
  public stopCallAudio() {
    this.isRinging = false;
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }
}

export const dstechCallAudio = new DStechCallAudio();
