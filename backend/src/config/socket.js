const { Server } = require("socket.io");

let io;

module.exports = {
  init: (httpServer, allowedOrigins) => {
    io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    io.on("connection", (socket) => {
      console.log("⚡ User connected:", socket.id);
      socket.on("disconnect", () => console.log("🔥 User disconnected"));
    });

    return io;
  },
  getIO: () => {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
  }
};