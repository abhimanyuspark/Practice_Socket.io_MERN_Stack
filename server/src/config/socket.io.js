const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("a user connected");

  //? reciveing from the client
  socket.on("chat message", (msg) => {
    //* sending to the client
    //? emit an event to all connected sockets
    io.emit("chat message", msg);
  });

  socket.on("typing", (user) => {
    io.emit("typing", user);
  });

  socket.on("delete message", (id) => {
    io.emit("delete message", id);
  });

  socket.on("edit message", (msg) => {
    io.emit("edit message", msg);
  });

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("user disconnected");

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

module.exports = { io, app, server };
