import { useEffect, useRef, useState } from "react";
import { socket } from "./api/socket";

interface Message {
  text: string;
  username: string;
  time: string;
  room?: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [username, setUsername] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [room, setRoom] = useState("General");
  const [users, setUsers] = useState<Record<string, string>>({});
  const [selectedUser, setSelectedUser] = useState("");

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ======================
  // REGISTER USER
  // ======================
  const joinChat = () => {
    if (!username.trim()) return;
    socket.emit("register", username);
  };

  // ======================
  // JOIN ROOM
  // ======================
  const joinRoom = () => {
    socket.emit("join_room", room);
  };

  // ======================
  // SEND PUBLIC MESSAGE
  // ======================
  const sendMessage = () => {
    if (!text.trim() || !username.trim()) return;

    const messageData = {
      text,
      username,
      time: new Date().toLocaleTimeString().slice(0, 5),
      room,
    };

    socket.emit("message", messageData);

    setMessages((prev) => [...prev, messageData]);

    setText("");
  };

  // ======================
  // SEND PRIVATE MESSAGE
  // ======================
  const sendPrivateMessage = () => {
    if (!text.trim() || !selectedUser) return;

    const messageData = {
      text,
      username,
      time: new Date().toLocaleTimeString().slice(0, 5),
      targetId: selectedUser,
    };

    socket.emit("private_message", messageData);

    setMessages((prev) => [...prev, messageData]);

    setText("");
  };

  // ======================
  // SOCKET LISTENERS
  // ======================
  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("private_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("typing", (user) => {
      setTypingUser(user);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser("");
      }, 800);
    });

    socket.on("users", (data) => {
      setUsers(data);
    });

    return () => {
      socket.off("message");
      socket.off("private_message");
      socket.off("typing");
      socket.off("users");
    };
  }, []);

  // ======================
  // AUTO SCROLL
  // ======================
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Real Time Chat App</h1>

      {/* JOIN */}
      <div>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <button onClick={joinChat}>Join Chat</button>
      </div>

      {/* USERS */}
      <div>
        <h3>Online Users</h3>
        {Object.entries(users).map(([id, name]) => (
          <div
            key={id}
            onClick={() => setSelectedUser(id)}
            style={{
              cursor: "pointer",
              fontWeight: selectedUser === id ? "bold" : "normal",
            }}
          >
            {name}
          </div>
        ))}
      </div>

      {/* ROOM */}
      <div>
        <select value={room} onChange={(e) => setRoom(e.target.value)}>
          <option value="General">General</option>
          <option value="Support">Support</option>
          <option value="Feedback">Feedback</option>
        </select>

        <button onClick={joinRoom}>Join Room</button>
      </div>

      {/* TYPING */}
      <p>{typingUser && `${typingUser} is typing...`}</p>

      {/* MESSAGES */}
      <div
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid black",
          padding: "10px",
        }}
      >
        {messages.map((msg, index) => {
          const isMe = msg.username === username;

          return (
            <div
              key={index}
              style={{
                textAlign: isMe ? "right" : "left",
                marginBottom: "8px",
              }}
            >
              <b>{msg.username}</b>: {msg.text} ({msg.time})
            </div>
          );
        })}

        <div ref={messageEndRef} />
      </div>

      {/* INPUT */}
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          socket.emit("typing", username);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (selectedUser) {
              sendPrivateMessage();
            } else {
              sendMessage();
            }
          }
        }}
        placeholder="Message..."
      />

      <button onClick={selectedUser ? sendPrivateMessage : sendMessage}>
        Send
      </button>
    </div>
  );
}

export default App;


// import "antd/dist/reset.css";
// import ChatApp from "./components/chat/ChatApp";

// export default function App() {
//   return <ChatApp />;
// }