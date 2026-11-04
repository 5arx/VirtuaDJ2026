export class DeckAudioPlayer {
  private buffer?: AudioBuffer;
  private source?: AudioBufferSourceNode;
  private loading?: Promise<AudioBuffer>;
  private offset = 0;
  private startedAt = 0;
  private shouldPlay = false;
  private playbackRate = 1;

  constructor(
    private readonly context: AudioContext,
    private readonly trackUrl: string,
  ) {}

  async play(): Promise<void> {
    this.shouldPlay = true;

    if (this.source) {
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
  }

  pause(): void {
    this.shouldPlay = false;

    if (!this.source || !this.buffer) {
      return;
    }

    this.updateOffset();
    this.source.stop();
    this.source.disconnect();
    this.source = undefined;
  }

  setPlaybackRate(rate: number): void {
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error(`Invalid playback rate: ${rate}`);
    }

    if (this.source && this.buffer) {
      this.updateOffset();
      this.source.playbackRate.setValueAtTime(rate, this.context.currentTime);
    }

    this.playbackRate = rate;
  }

  private updateOffset(): void {
    if (!this.source || !this.buffer) {
      return;
    }

    const elapsedTrackTime =
      (this.context.currentTime - this.startedAt) * this.playbackRate;
    this.offset = (this.offset + elapsedTrackTime) % this.buffer.duration;
    this.startedAt = this.context.currentTime;
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
