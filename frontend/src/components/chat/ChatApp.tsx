import { useState } from "react";
import ChatScreen from "./ChatScreen";
import { socket } from "../../api/socket";

export default function ChatApp() {
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const login = () => {
    if (!username.trim()) return;

    socket.emit("register", username);
    setLoggedIn(true);
  };

  if (!loggedIn) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Login</h2>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
        />

        <button onClick={login}>Join Chat</button>
      </div>
    );
  }

  return <ChatScreen username={username} />;
}
