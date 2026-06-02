const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("message", (data) => {
    console.log("Frontenddan keldi:", data);

    socket.broadcast.emit("message", {
      text: data.text,
      username: data.username,
      time: data.time,
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
});

app.get("/", (req, res) => {
  res.send("Server ishlamoqda...");
});

server.listen(5000, () => {
  console.log("Server 5000-portda ishlamoqda...");
});
