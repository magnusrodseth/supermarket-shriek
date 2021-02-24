//// Verktøy og filer inkludert for your convenience.
// Implementeres i oppgave 1
import askMicrophonePermission from "./audio";
// hjelpeverktøy for oppgave 1.
import createTestVolumeProgress from "./lib/test-volume";

// Implementeres i Oppgave 3
import controlsInput from "./controls-input";
// Brukes i oppgave 3
import Cart from "./lib/cart";
import World from "./lib/world";

// Brukes i Oppgave 4.
import connectPeer from "./lib/client";
// ------

////////////////////////////////////////
// Oppgave 1: Volume progress (20min)
// 1. Implementer uthenting av volum basert på
//    UserMedia, AudioWorklets
// 2. Bruk client/lib/test-volume.ts for å bekrefte
//    at alt fungerer.
////////////////////////////////////////
// Tool to help you test volume
// const setTestVolume = createTestVolumeProgress();
// setTestVolume(0.5); // example

////////////////////////////////////////
// Oppgave 2: Drag race (15min)
// 1. Lag en enkel render-loop.
// 2. Hent ut player fra DOM, bruk Volume fra tidligere
//    til å kjøre translateX på Player-elementet.
////////////////////////////////////////

////////////////////////////////////////
// Oppgave 3: Event Listeners (10min)
// 1. Lag en ControlInput modul som holder
//    tilstand på venstre/høyre.
// 2. Bruk cart.updateByVolume til å hente ut
//    ny x, y, og degrees.
// 3. Bruk transform basert på resultat fra
//    forrige steg.
// 4. Kjør cart!
////////////////////////////////////////
// Bruk i oppgave 3 og 4
// const root = document.querySelector("svg");
// const world = new World(root);
// const cart = new Cart(playerElement, world);

////////////////////////////////////////
// Oppgave 4: PeerJS
// Ta i bruk connectPeer for å koble til server.
//
// *NB:* Kan være du må flytte denne blokka opp
//       over steg 2/3 for å ha tilgang på variabler.
//
// 1. Connect og send inn Nick.
// 2. Tegn vegger, mål og motstandere.
// 3. Gi varsel (window.alert) om noen vinner.
// 4. Send nye kordinater via server.
////////////////////////////////////////
