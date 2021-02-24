export default function createTestVolumeProgress() {
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
