import Peer from "peerjs";
import { RecieveDataPayload, SendDataPayload } from "../../types";

// TODO: Change serverId to something random and usable
const serverId = "test-shriek-local";

type Listener = (data: RecieveDataPayload) => void;

const connect = (onConnect: () => void) => {
  let connectionIsOpened = false;
  let connection: Peer.DataConnection = null;

  let listener: Listener = () => { };

  const peer = new Peer(null, { debug: 2 });

  peer.on("open", (c) => {
    connection = peer.connect(serverId);
    connection.on("open", () => {
      connectionIsOpened = true;
      onConnect();
    });
    connection.on("data", listener);
  });

  return {
    onData: (cb: Listener) => {
      listener = cb;
    },
    send: (data: SendDataPayload) => {
      if (connectionIsOpened)
        connection.send(data);
    },
  };
}

export default connect;