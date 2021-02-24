/**
 * Redundant method. Keep until further notics, but should be usable anymore.
 */
const createTestVolumeProgress = () => {
  const div = document.createElement("div");
  div.classList.add("volume");

  const progress = document.createElement("progress");
  progress.value = 0;

  div.appendChild(progress);

  document.body.appendChild(div);

  return function updateVolume(volume: number) {
    progress.value = volume;
  };
}

export default createTestVolumeProgress;