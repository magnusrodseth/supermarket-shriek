const ATTACK = 0.3;
const INTERVAL_MS = 200;

registerProcessor(
  "volumeworklet",
  class VolumeWorklet extends AudioWorkletProcessor {
    constructor() {
      super();
      this.previousAudioBlockVolumes = [0, 0, 0];
      this.previousSampleUpdateFrame = 0;
      this.previousSentVolume = 0;
    }

    process(inputs, outputs, parameters) {
      // select first channel (should be mono from microphone)
      const channel = inputs[0];

      // Make sure something is connected
      if (channel && channel.length > 0) {
        const samples = channel[0];

        let squaredSum = 0;
        // Calculated the squared-sum of all samples in current audio block
        for (let i = 0; i < samples.length; ++i)
          squaredSum += samples[i] * samples[i];

        // Calculate the root mean-square for samples squared-sum
        // the RMS approximates a volume across samples in current frame
        const currentVolume = Math.sqrt(squaredSum / samples.length);

        // sampleRate is available from the AudioWorklet global scope:
        // https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope
        // sampleRate is expressed in hertz, like 48000 Hz
        // Hertz in this case means samples per second
        // So to send an update every "INTERVAL_MS" (200 ms),
        // we must find how many samples are processed in 0.2 sec (200 / 1000)
        const updateIntervalInSamples = sampleRate * (INTERVAL_MS / 1000);

        // currentFrame is available from the AudioWorklet global scope:
        // https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope
        if (
          currentFrame >
          this.previousSampleUpdateFrame + updateIntervalInSamples
        ) {
          // Set current frame as update frame
          this.previousSampleUpdateFrame = currentFrame;

          // Calculate avg volume from all processed
          // audio blocks since last update
          let numberOfCalculatedVolumes =
            this.previousAudioBlockVolumes.length + 1;
          let volumeBlocksSum = currentVolume;
          for (let i = 0; i < this.previousAudioBlockVolumes.length; ++i)
            volumeBlocksSum += this.previousAudioBlockVolumes[i];
          const avgVolumeAcrossAudioBlocks =
            volumeBlocksSum / numberOfCalculatedVolumes;

          // reset volume cache
          this.previousAudioBlockVolumes = [];

          // Fast attack, slow release
          // This means we want to react quickly when volume goes up
          // but more slowly when volume goes down
          this.previousSentVolume = Math.max(
            avgVolumeAcrossAudioBlocks,
            this.previousSentVolume * ATTACK
          );

          // Send volume across message port
          this.port.postMessage({ volume: this.previousSentVolume });
        } else {
          // Hasn't been 200 ms since last update,
          // cache the current volume
          this.previousAudioBlockVolumes.push(currentVolume);
        }
      }

      return true;
    }
  }
);
