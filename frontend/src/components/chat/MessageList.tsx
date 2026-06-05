import { Avatar, Typography } from "antd";
import { CheckOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

type Message = {
  username: string;
  text: string;
  time: string;
  read: boolean;
  isMe: boolean;
};

export default function MessageList({ messages }: { messages: Message[] }) {

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: msg.isMe ? "flex-end" : "flex-start",
            alignItems: "flex-end",
            gap: 8,
            marginBottom: 12,
          }}
        >
          {/* Boshqa odamning avatari */}
          {!msg.isMe && (
            <Avatar
              size={32}
              style={{
                backgroundColor: "#2563eb",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {msg.username?.charAt(0).toUpperCase()}
            </Avatar>
          )}

          {/* Bubble */}
          <div
            style={{
              maxWidth: "60%",
              padding: "8px 14px",
              borderRadius: msg.isMe
                ? "16px 16px 4px 16px"
                : "16px 16px 16px 4px",
              background: msg.isMe ? "#1677ff" : "#f0f0f0",
              color: msg.isMe ? "#fff" : "inherit",
            }}
          >
            {/* Username (faqat boshqalarda) */}
            {!msg.isMe && (
              <Text
                style={{
                  fontSize: 11,
                  color: "#888",
                  display: "block",
                  marginBottom: 2,
                }}
              >
                {msg.username}
              </Text>
            )}

            {/* Xabar matni */}
            <Text
              style={{ color: msg.isMe ? "#fff" : "inherit", fontSize: 14 }}
            >
              {msg.text}
            </Text>

            {/* Vaqt + read */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 4,
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: msg.isMe ? "rgba(255,255,255,0.65)" : "#aaa",
                }}
              >
                {msg.time}
              </Text>
              {msg.isMe &&
                (msg.read ? (
                  <CheckCircleOutlined
                    style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}
                  />
                ) : (
                  <CheckOutlined
                    style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}
                  />
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
