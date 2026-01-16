import {
  cbor,
  NetworkAdapter,
  type PeerId,
  type PeerMetadata,
} from "@automerge/automerge-repo";
import {
  type FromClientMessage,
  type FromServerMessage,
  ProtocolV1,
} from "@automerge/automerge-repo-network-websocket";
import { isJoinMessage } from "@automerge/automerge-repo-network-websocket/dist/messages.js";
import type { WSContext } from "hono/ws";

export const toArrayBuffer = (bytes: Uint8Array) => {
  const { buffer, byteOffset, byteLength } = bytes;
  return buffer.slice(byteOffset, byteOffset + byteLength) as ArrayBuffer;
};

export class WebsocketAutomergeAdapter extends NetworkAdapter {
  private remotePeerId: PeerId | null = null;

  constructor(private ws: WSContext) {
    super();
  }

  connect(peerId: PeerId, peerMetadata?: PeerMetadata): void {
    this.peerId = peerId;
    this.peerMetadata = peerMetadata;
  }

  disconnect(): void {
    if (this.remotePeerId) {
      this.emit("peer-disconnected", { peerId: this.remotePeerId });
    }
    this.ws.close();
  }

  send(message: FromServerMessage): void {
    if (this.ws.readyState !== 1) return;

    const encoded = cbor.encode(message);
    this.ws.send(toArrayBuffer(encoded));
  }

  isReady(): boolean {
    return this.ws.readyState === 1;
  }

  whenReady(): Promise<void> {
    return new Promise(() => {});
  }

  receiveMessage(messageBytes: Uint8Array) {
    let message: FromClientMessage;
    try {
      message = cbor.decode(messageBytes);
    } catch (e) {
      console.error(
        "[Automerge: Network]: invalid message received, closing connection",
        e,
      );
      this.disconnect();
      return;
    }

    const { senderId } = message;

    if (isJoinMessage(message)) {
      const { peerMetadata } = message;
      this.remotePeerId = senderId;
      this.emit("peer-candidate", { peerId: senderId, peerMetadata });
      this.send({
        type: "peer",
        senderId: this.peerId!,
        peerMetadata: this.peerMetadata!,
        selectedProtocolVersion: ProtocolV1,
        targetId: senderId,
      });
    } else {
      console.log(
        "[Automerge: Newtork]: received message for documentid: ",
        message.documentId,
      );

      this.emit("message", message);
    }
  }
}
