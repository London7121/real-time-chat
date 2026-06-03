type Message = {
  username: string;
  text: string;
  time: string;
  read: boolean;
  isMe: boolean;
};

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
      {messages.map((msg: Message, i: number) => {
        const isMe = msg.isMe;

        return (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: isMe ? "flex-end" : "flex-start",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                maxWidth: "60%",
                padding: "10px 14px",
                borderRadius: 12,
                background: isMe ? "#1677ff" : "#f5f5f5",
                color: isMe ? "white" : "black",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7 }}>{msg.username}</div>

              <div>{msg.text}</div>

              <div style={{ fontSize: 10, opacity: 0.6 }}>
                {msg.time} {msg.read ? "✓✓" : "✓"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
