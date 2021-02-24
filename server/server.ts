import Peer from "peerjs";
import {
  CustomAttributes,
  CustomElement,
  RecieveDataPayload,
  SendDataPayload,
  TransformData,
} from "../types";
const serverId = "test-shriek-local";
const peer = new Peer(serverId, { debug: 2 });

const UPDATE_RATE_MULTIPLAYER_IN_MS = 200;

const wallElements = extractElementChildren(
  document.querySelector("#walls").children
);
const goalElement = extractElementChildren(
  document.querySelector("#goal").children
);
const getOpponents = () =>
  extractElementChildren(document.querySelectorAll(".player"));
const goalElementPos = document.querySelector("#goal").getBoundingClientRect();

function updateMultiplayer() {
  const opponents = getOpponents();
  // broadcast({ type: "update-opponents", payload:  });

  Object.entries(peer.connections).forEach(
    ([key, setOfConnections]: [string, any]) => {
      setOfConnections.forEach((con: Peer.DataConnection) => {
        const filteredOpponents = opponents.filter(
          (node) => !getAttribute<string>(node, "id")?.includes(key)
        );
        send(con, { type: "update-opponents", payload: filteredOpponents });
      });
    }
  );
}
setInterval(updateMultiplayer, UPDATE_RATE_MULTIPLAYER_IN_MS);

function draw(pos: TransformData, playerEl: Element) {
  const transform = `translate(${pos.x}, ${pos.y}) rotate(${pos.degrees})`;
  playerEl.setAttribute("transform", transform);
}
function drawNick(pos: TransformData, nickDiv: HTMLElement) {
  const baseX = 50;
  const baseY = 30;
  nickDiv.style.left = `${baseX + pos.x}px`; //`${transform} rotate(0)`;
  nickDiv.style.top = `${baseY + pos.y}px`; //`${transform} rotate(0)`;
}

peer.on("open", function () {
  document.querySelector("#server-id").innerHTML = peer.id;
  console.log("ID: " + peer.id);
});
peer.on("error", function (err) {
  console.log(err);
});

function send(conn: Peer.DataConnection, message: RecieveDataPayload) {
  return conn.send(message);
}
function broadcast(message: RecieveDataPayload) {
  Object.values(peer.connections).forEach((setOfConnections: any) => {
    setOfConnections.forEach((con: Peer.DataConnection) => send(con, message));
  });
}

peer.on("connection", (conn) => {
  const playerId = conn.peer;
  const playerEl = spawnPlayer(playerId);
  const playerNick = spawNickBox(playerId);

  conn.on("data", (data: SendDataPayload) => {
    switch (data.type) {
      case "transform":
        draw(data.payload, playerEl);
        drawNick(data.payload, playerNick);

        if (checkWinner(playerEl)) {
          broadcast({
            type: "winner",
            payload: playerNick.innerText,
          });
        }
        break;
      case "nick":
        playerNick.innerText = data.payload?.slice(0, 10);
        break;
    }
  });
  conn.on("open", () => {
    send(conn, { type: "walls", payload: wallElements });
    send(conn, { type: "goal", payload: goalElement });
  });
  conn.on("close", () => {
    despawn(playerId);
    send(conn, { type: "remove-opponents", payload: playerId });
  });
});

const svgRoot = document.querySelector("svg");
const appRoot = document.querySelector("#app");

function spawnPlayer(playerId: string) {
  const playerColor = getRandomColor();
  // const playerSvgEl = document.createElementNS(
  //   "http://www.w3.org/2000/svg",
  //   "g"
  // );
  // playerSvgEl.id = playerId;
  // playerSvgEl.classList.add("player");
  // playerSvgEl.setAttribute("data-color", playerColor);

  const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathEl.setAttribute("d", "M44 42.6795L74 60L44 77.3205L44 42.6795Z");
  pathEl.setAttribute("stroke", playerColor);
  pathEl.setAttribute("stroke-width", "6");
  pathEl.id = playerId;
  pathEl.classList.add("player");

  // playerSvgEl.appendChild(pathEl);
  svgRoot.appendChild(pathEl);
  return pathEl;
}

function checkWinner(player: Element) {
  var playerRect = player.getBoundingClientRect();

  return !(
    goalElementPos.left > playerRect.right ||
    goalElementPos.right < playerRect.left ||
    goalElementPos.top > playerRect.bottom ||
    goalElementPos.bottom < playerRect.top
  );
}

function spawNickBox(playerId: string) {
  const div = document.createElement("div");
  div.className = "nick";
  div.id = `${playerId}-nick`;
  appRoot.appendChild(div);
  return div;
}

function despawn(playerId: string) {
  const el = document.querySelector(`#${playerId}`);
  if (el) el.remove();
  const nick = document.querySelector(`#${playerId}-nick`);
  if (nick) nick.remove();
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function extractAttributes(attributes: NamedNodeMap): CustomAttributes[] {
  const map = [];
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes.item(i);
    map.push({ name: attr.name, value: attr.value });
  }
  return map;
}

function extractElementChildren(
  children: HTMLCollection | NodeListOf<Element>
): CustomElement[] {
  const map = [];
  for (let i = 0; i < children.length; i++) {
    const child = children.item(i);
    map.push({
      nodeName: child.nodeName,
      attributes: extractAttributes(child.attributes),
    });
  }
  return map;
}

function getAttribute<T>(node: CustomElement, name: string): T | undefined {
  for (let attr of node.attributes) {
    if (attr.name === name) return attr.value as T;
  }
  return undefined;
}
