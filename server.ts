import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: [
      "http://localhost:3000",
      "https://xieffect.ru",
      "https://ap.xieffect.ru",
      "https://app.xieffect.ru",
      "https://front.xieffect.ru",
      "https://xieffect.netlify.app",
    ],
    credentials: true,
  }
});
const PORT = parseInt(process.env.PORT) || 5000;

// adapted & modified from: https://github.com/maks1mp/video-chat-webrtc

const ACTIONS = {
  JOIN: "join",
  LEAVE: "leave",
  ADD_PEER: "add-peer",
  REMOVE_PEER: "remove-peer",
  RELAY_SDP: "relay-sdp",
  RELAY_ICE: "relay-ice",
  ICE_CANDIDATE: "ice-candidate",
  SESSION_DESCRIPTION: "session-description"
};

const roomID = "hey"

io.on("connection", socket => {
  socket.on(ACTIONS.JOIN, () => {
    const { rooms } = socket;

    if (Array.from(rooms).includes(roomID)) {
      return "Already joined";
    }

    const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

    clients.forEach(clientID => {
      io.to(clientID).emit(ACTIONS.ADD_PEER, {
        peerID: socket.id,
        createOffer: false
      });

      io.to(roomID).except(clientID).emit(ACTIONS.ADD_PEER, {
        peerID: clientID,
        createOffer: true,
      });
    });

    socket.join(roomID);
  });

  function leaveRoom() {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

    clients.forEach(clientID => {
      io.to(clientID).emit(ACTIONS.REMOVE_PEER, {
        peerID: socket.id,
      });

      io.to(roomID).except(clientID).emit(ACTIONS.REMOVE_PEER, {
        peerID: clientID,
      });
    });

    socket.leave(roomID);
  }

  socket.on(ACTIONS.LEAVE, leaveRoom);
  socket.on("disconnecting", leaveRoom);

  socket.on(ACTIONS.RELAY_SDP, ({ peerID, sessionDescription }) => {
    io.to(peerID).emit(ACTIONS.SESSION_DESCRIPTION, {
      peerID: socket.id,
      sessionDescription,
    });
  });

  socket.on(ACTIONS.RELAY_ICE, ({ peerID, iceCandidate }) => {
    io.to(peerID).emit(ACTIONS.ICE_CANDIDATE, {
      peerID: socket.id,
      iceCandidate,
    });
  });

});

io.listen(PORT);
console.log("Server started");
