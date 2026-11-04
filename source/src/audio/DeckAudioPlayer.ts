export class DeckAudioPlayer {
  private buffer?: AudioBuffer;
  private source?: AudioBufferSourceNode;
  private loading?: Promise<AudioBuffer>;
  private offset = 0;
  private startedAt = 0;
  private shouldPlay = false;
  private playbackRate = 1;
  private activePlaybackRate = 1;
  private spinDownFrame?: number;

  constructor(
    private readonly context: AudioContext,
    private readonly trackUrl: string,
  ) {}

  async play(): Promise<void> {
    this.shouldPlay = true;

    if (this.source) {
      this.cancelSpinDown();
      this.applyActivePlaybackRate(this.playbackRate);
      return;
    }

    await this.context.resume();
    const buffer = await this.load();

    // The deck may have been stopped while its track was decoding.
    if (this.source || !this.shouldPlay) {
      return;
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.playbackRate.value = this.playbackRate;
    source.connect(this.context.destination);
    source.start(0, this.offset);

    this.source = source;
    this.startedAt = this.context.currentTime;
    this.activePlaybackRate = this.playbackRate;
  }

  pause(): void {
    this.shouldPlay = false;
    this.cancelSpinDown();

    if (!this.source || !this.buffer) {
      return;
    }

    this.updateOffset();
    this.source.stop();
    this.source.disconnect();
    this.source = undefined;
    this.activePlaybackRate = this.playbackRate;
  }

  setPlaybackRate(rate: number): void {
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error(`Invalid playback rate: ${rate}`);
    }

    this.cancelSpinDown();
    this.playbackRate = rate;
    this.applyActivePlaybackRate(rate);
  }

  spinDown(durationSeconds = 4.5): void {
    if (!this.source || durationSeconds <= 0) {
      this.pause();
      return;
    }

    this.cancelSpinDown();
    const initialRate = this.activePlaybackRate;
    const startedAt = performance.now();

    const update = (now: number): void => {
      const progress = Math.min((now - startedAt) / (durationSeconds * 1000), 1);
      const rate = Math.max(initialRate * (1 - progress ** 1.4), 0.01);

      this.applyActivePlaybackRate(rate);

      if (progress < 1) {
        this.spinDownFrame = requestAnimationFrame(update);
      } else {
        this.spinDownFrame = undefined;
        this.pause();
      }
    };

    this.spinDownFrame = requestAnimationFrame(update);
  }

  private applyActivePlaybackRate(rate: number): void {
    if (this.source && this.buffer) {
      this.updateOffset();
      this.source.playbackRate.setValueAtTime(rate, this.context.currentTime);
    }

    this.activePlaybackRate = rate;
  }

  private updateOffset(): void {
    if (!this.source || !this.buffer) {
      return;
    }

    const elapsedTrackTime =
      (this.context.currentTime - this.startedAt) * this.activePlaybackRate;
    this.offset = (this.offset + elapsedTrackTime) % this.buffer.duration;
    this.startedAt = this.context.currentTime;
  }

  private cancelSpinDown(): void {
    if (this.spinDownFrame !== undefined) {
      cancelAnimationFrame(this.spinDownFrame);
      this.spinDownFrame = undefined;
    }
  }

  private load(): Promise<AudioBuffer> {
    if (this.buffer) {
      return Promise.resolve(this.buffer);
    }

    this.loading ??= fetch(this.trackUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load ${this.trackUrl} (${response.status}).`);
        }
        return response.arrayBuffer();
      })
      .then((data) => this.context.decodeAudioData(data))
      .then((buffer) => {
        this.buffer = buffer;
        return buffer;
      });

    return this.loading;
  }
}
