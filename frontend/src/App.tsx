import { useEffect, useState } from "react";
import { socket } from "./socket";

function App() {
  const [message, setMessage] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    socket.on("message", (data) => {
      setMessage((prev) => [
        ...prev,
        `${data.username}: ${data.text} (${data.time})`,
      ]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    const messageData = {
      text,
      username,
      time: new Date().toLocaleTimeString().slice(0, 5),
    };
    socket.emit("message", messageData);

    setMessage((prev) => [...prev, `Me: ${text} (${messageData.time})`]);
  };

  return (
    <div>
      <h1>Real Time Chat App</h1>

      <div>
        {message.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="xabar"
      />

      <button onClick={sendMessage}>Send message</button>
    </div>
  );
}

export default App;
