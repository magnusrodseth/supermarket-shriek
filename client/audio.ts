// Connecting to user media to retrieve volume.
const askMicrophonePermission = async (onVolume: (volume: number) => void) => {
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
    });
    const audioContext = new AudioContext();

    const source = audioContext.createMediaStreamSource(stream);

    await audioContext.audioWorklet.addModule("./volume-worklet.js");

    const workletNode = new AudioWorkletNode(
        audioContext,
        'volumeworklet',
    );

    workletNode.port.onmessage = (message) => {
        onVolume(message.data.volume);
    };

    source
        .connect(workletNode)
        .connect(audioContext.destination);
}

export default askMicrophonePermission;