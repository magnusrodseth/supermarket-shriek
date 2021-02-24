import Peer from "peerjs";
import {
  CustomAttributes,
  CustomElement,
  RecieveDataPayload,
  SendDataPayload,
  TransformData,
} from "../types";

// TODO: Change serverId to something random and usable
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

const goalElementPosition = document.querySelector("#goal").getBoundingClientRect();

/**
 * TODO: Add some great docs here
 */
const updateMultiplayer = () => {
  const opponents = getOpponents();

  Object.entries(peer.connections).forEach(
    ([key, setOfConnections]: [string, any]) => {
      setOfConnections.forEach((connection: Peer.DataConnection) => {
        const filteredOpponents = opponents.filter(
          (node) => !getAttribute<string>(node, "id")?.includes(key)
        );
        send(connection, { type: "update-opponents", payload: filteredOpponents });
      });
    }
  );
}
setInterval(updateMultiplayer, UPDATE_RATE_MULTIPLAYER_IN_MS);

const draw = (position: TransformData, playerElement: Element) => {
  const transform = `translate(${position.x}, ${position.y}) rotate(${position.degrees})`;
  playerElement.setAttribute("transform", transform);
}

const drawNickname = (position: TransformData, nicknameDiv: HTMLElement) => {
  const baseX = 50;
  const baseY = 30;
  nicknameDiv.style.left = `${baseX + position.x}px`; //`${transform} rotate(0)`;
  nicknameDiv.style.top = `${baseY + position.y}px`; //`${transform} rotate(0)`;
}

peer.on("open", () => {
  document.querySelector("#server-id").innerHTML = peer.id;
  console.log("ID: " + peer.id);
});

peer.on("error", (err) => {
  console.log(err);
});

const send = (connection: Peer.DataConnection, message: RecieveDataPayload) => {
  return connection.send(message);
}

const broadcast = (message: RecieveDataPayload) => {
  Object.values(peer.connections).forEach((setOfConnections: any) => {
    setOfConnections.forEach((connection: Peer.DataConnection) => send(connection, message));
  });
}

peer.on("connection", (connection) => {
  const playerId = connection.peer;
  const playerElement = spawnPlayer(playerId);
  const playerNickname = spawnNicknameBox(playerId);

  connection.on("data", (data: SendDataPayload) => {
    switch (data.type) {
      case "transform":
        draw(data.payload, playerElement);
        drawNickname(data.payload, playerNickname);

        if (checkWinner(playerElement)) {
          broadcast({
            type: "winner",
            payload: playerNickname.innerText,
          });
        }
        break;
      case "nick":
        playerNickname.innerText = data.payload?.slice(0, 10);
        break;
    }
  });

  connection.on("open", () => {
    send(connection, { type: "walls", payload: wallElements });
    send(connection, { type: "goal", payload: goalElement });
  });

  connection.on("close", () => {
    despawn(playerId);
    send(connection, { type: "remove-opponents", payload: playerId });
  });
});

const svgRoot = document.querySelector("svg");
const appRoot = document.querySelector("#app");

const spawnPlayer = (playerId: string) => {
  const playerColor = getRandomColor();

  // const playerSvgEl = document.createElementNS(
  //   "http://www.w3.org/2000/svg",
  //   "g"
  // );
  // playerSvgEl.id = playerId;
  // playerSvgEl.classList.add("player");
  // playerSvgEl.setAttribute("data-color", playerColor);

  const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathElement.setAttribute("d", "M44 42.6795L74 60L44 77.3205L44 42.6795Z");
  pathElement.setAttribute("stroke", playerColor);
  pathElement.setAttribute("stroke-width", "6");
  pathElement.id = playerId;
  pathElement.classList.add("player");

  // playerSvgEl.appendChild(pathEl);
  svgRoot.appendChild(pathElement);
  return pathElement;
}

const checkWinner = (player: Element) => {
  const playerPosition = player.getBoundingClientRect();

  return !(
    goalElementPosition.left > playerPosition.right ||
    goalElementPosition.right < playerPosition.left ||
    goalElementPosition.top > playerPosition.bottom ||
    goalElementPosition.bottom < playerPosition.top
  );
}

const spawnNicknameBox = (playerId: string) => {
  const div = document.createElement("div");
  div.className = "nick";
  div.id = `${playerId}-nick`;
  appRoot.appendChild(div);
  return div;
}

const despawn = (playerId: string) => {
  const element = document.querySelector(`#${playerId}`);

  if (element)
    element.remove();

  const nick = document.querySelector(`#${playerId}-nick`);

  if (nick)
    nick.remove();
}

const getRandomColor = () => {
  // TODO: Add some pleasing colors and select from these
  const letters = "0123456789ABCDEF";

  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const extractAttributes = (attributes: NamedNodeMap): CustomAttributes[] => {
  const map = [];

  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes.item(i);
    map.push({ name: attribute.name, value: attribute.value });
  }
  return map;
}

// TODO: Why can't this be const instead of function?
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

const getAttribute = <T>(node: CustomElement, name: string): T | undefined => {
  for (let attr of node.attributes) {
    if (attr.name === name)
      return attr.value as T;
  }
  return undefined;
}
