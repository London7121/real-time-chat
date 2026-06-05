const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
    allowed.test(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error("Fayl turi ruxsat etilmagan"));
  },
});

app.use("/uploads", express.static("uploads"));

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Fayl topilmadi" });
  res.json({
    url: `http://localhost:5000/uploads/${req.file.filename}`,
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
  });
});

// STATIK FOYDALANUVCHILAR
const STATIC_USERS = [
  { id: "1", username: "ali", password: "1234", avatar: "A" },
  { id: "2", username: "vali", password: "1234", avatar: "V" },
  { id: "3", username: "salim", password: "1234", avatar: "S" },
  { id: "4", username: "jasur", password: "1234", avatar: "J" },
  { id: "5", username: "nozima", password: "1234", avatar: "N" },
];

const GROUP = { id: "group_general", name: "General", isGroup: true };

const onlineSockets = {}; // { socketId: userId }
const userSockets = {}; // { userId: socketId }

const messages = { group_general: [] };

const pinnedMessages = {};

function privateKey(a, b) {
  return [a, b].sort().join("_");
}

function getOnlineUserIds() {
  return [...new Set(Object.values(onlineSockets))];
}

function now() {
  return new Date().toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ======================
// REST
// ======================
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = STATIC_USERS.find(
    (u) => u.username === username && u.password === password,
  );
  if (!user)
    return res.status(401).json({ error: "Login yoki parol noto'g'ri" });
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.get("/users", (req, res) => {
  const safeUsers = STATIC_USERS.map(({ password: _, ...u }) => u);
  res.json({ users: safeUsers, group: GROUP });
});

// ======================
// SOCKET
// ======================
io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("user_online", (userId) => {
    const prevSocket = userSockets[userId];
    if (prevSocket && prevSocket !== socket.id) {
      delete onlineSockets[prevSocket];
    }

    onlineSockets[socket.id] = userId;
    userSockets[userId] = socket.id;

    socket.join("group_general");
    io.emit("online_users", getOnlineUserIds());

    console.log(`user_online: ${userId} → socket ${socket.id}`);
  });

  socket.on("group_message", (data) => {
    const msg = {
      id: Date.now(),
      senderId: data.senderId,
      text: data.text || "",
      file: data.file || null,
      time: now(),
      status: "sent",
    };
    messages["group_general"].push(msg);
    // ✅ io.to() — faqat shu room a'zolariga, sender ham ichida
    io.to("group_general").emit("group_message", msg);
    console.log("group_message sent:", msg);
  });

  socket.on("private_message", (data) => {
    const key = privateKey(data.senderId, data.receiverId);
    if (!messages[key]) messages[key] = [];

    const msg = {
      id: Date.now(),
      senderId: data.senderId,
      receiverId: data.receiverId,
      text: data.text || "",
      file: data.file || null,
      time: now(),
      status: "sent",
    };
    messages[key].push(msg);

    // ✅ Yuboruvchiga
    socket.emit("private_message", msg);

    const receiverSocket = userSockets[data.receiverId];
    if (receiverSocket && receiverSocket !== socket.id) {
      io.to(receiverSocket).emit("private_message", msg);
    }

    console.log(
      `private_message: ${data.senderId} → ${data.receiverId}`,
      msg.id,
    );
  });

  socket.on("get_history", (data) => {
    if (data.type === "group") {
      socket.emit("history", {
        chatId: "group_general",
        messages: messages["group_general"],
      });
      console.log(
        "history sent: group_general, count:",
        messages["group_general"].length,
      );
    } else {
      const key = privateKey(data.userId, data.targetId);
      socket.emit("history", {
        chatId: key,
        messages: messages[key] || [],
      });
      console.log(`history sent: ${key}, count:`, (messages[key] || []).length);
    }
  });

  socket.on("typing", (data) => {
    if (data.type === "group") {
      socket.to("group_general").emit("typing", {
        senderId: data.senderId,
        chatId: "group_general",
      });
    } else {
      const receiverSocket = userSockets[data.receiverId];
      if (receiverSocket) {
        io.to(receiverSocket).emit("typing", {
          senderId: data.senderId,
          chatId: privateKey(data.senderId, data.receiverId),
        });
      }
    }
  });

  socket.on("message_delivered", ({ msgId, senderId }) => {
    const senderSocket = userSockets[senderId];
    if (senderSocket) io.to(senderSocket).emit("message_delivered", { msgId });
  });

  socket.on("message_read", ({ msgId, senderId }) => {
    const senderSocket = userSockets[senderId];
    if (senderSocket) io.to(senderSocket).emit("message_read", { msgId });
  });

  socket.on("delete_message", ({ msgId, chatId, isGroup, receiverId }) => {
    if (isGroup) {
      messages["group_general"] = messages["group_general"].filter(
        (m) => m.id !== msgId,
      );
      io.to("group_general").emit("message_deleted", { msgId, chatId });
    } else {
      if (messages[chatId]) {
        messages[chatId] = messages[chatId].filter((m) => m.id !== msgId);
      }
      socket.emit("message_deleted", { msgId, chatId });
      const receiverSocket = userSockets[receiverId];
      if (receiverSocket && receiverSocket !== socket.id) {
        io.to(receiverSocket).emit("message_deleted", { msgId, chatId });
      }
    }
  });

  socket.on("pin_message", ({ msg, chatId, isGroup, receiverId }) => {
    pinnedMessages[chatId] = msg;
    if (isGroup) {
      io.to("group_general").emit("pinned_message", { msg, chatId });
    } else {
      socket.emit("pinned_message", { msg, chatId });
      const receiverSocket = userSockets[receiverId];
      if (receiverSocket && receiverSocket !== socket.id) {
        io.to(receiverSocket).emit("pinned_message", { msg, chatId });
      }
    }
  });

  socket.on("unpin_message", ({ chatId, isGroup, receiverId }) => {
    delete pinnedMessages[chatId];
    if (isGroup) {
      io.to("group_general").emit("pinned_message", { msg: null, chatId });
    } else {
      socket.emit("pinned_message", { msg: null, chatId });
      const receiverSocket = userSockets[receiverId];
      if (receiverSocket && receiverSocket !== socket.id) {
        io.to(receiverSocket).emit("pinned_message", { msg: null, chatId });
      }
    }
  });

  socket.on("disconnect", () => {
    const userId = onlineSockets[socket.id];
    if (userId) {
      delete onlineSockets[socket.id];
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
      }
      io.emit("online_users", getOnlineUserIds());
      console.log(`disconnected: ${userId} (${socket.id})`);
    }
  });
});

server.listen(5000, () => console.log("Server: http://localhost:5000"));
