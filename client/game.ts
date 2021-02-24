import askMicrophonePermission from "./audio";
import Cart from "./lib/cart";
import World from "./lib/world";
import connectPeer from "./lib/client";

// Set value of valume using volume-worklet.js
let volume = 0;

askMicrophonePermission((v) => {
    volume += v;
});

// Define variables to be used during game loop
const root = document.querySelector("svg");
const player = document.querySelector('#player');
const world = new World(root);
const cart = new Cart(player, world);

let left, right;

// Add event listeners to key press
// TODO: Make right turn corresponds to louder volume and left turn corresponds to lower volume
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case ("ArrowRight"):
            right = true;
            left = false;
            break;
        case ("ArrowLeft"):
            left = true;
            right = false;
            break;
    }
})

document.addEventListener('keyup', (event) => {
    left = false;
    right = false;
})

// Game loop
const loop = () => {
    const position = cart.updateByVolume(left, right, volume);

    const transform = `translate(${position.x}, ${position.y}) rotate(${position.degrees})`;
    player.setAttribute('transform', transform);

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Connect to server
const peerClient = connectPeer(() => {
    // Payload is the user's nickname
    peerClient.send({ type: 'nick', payload: 'Donkey' });
});

peerClient.onData((data) => {
    switch (data.type) {
        case 'walls':
            return world.drawWalls(data.payload);
        case 'goal':
            return world.drawGoal(data.payload);
        case 'update-opponents':
            return world.updateOpponents(data.payload);
        case 'remove-opponents':
            return world.removeOpponents(data.payload);
        case 'winner':
            alert(`Winner!\n The winner is... ${data.payload}`);
            return cart.reset();
    }
});