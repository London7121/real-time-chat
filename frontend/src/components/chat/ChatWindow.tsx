import { useEffect, useState } from "react";
import { socket } from "../../api/socket";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

type ChatWindowProps = {
  selectedUser: { id: string } | null;
  username: string;
};

type Message = {
  username: string;
  text: string;
  time: string;
  read: boolean;
  isMe: boolean;
};
export default function ChatWindow({ selectedUser}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    socket.on("message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("private_message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("message");
      socket.off("private_message");
    };
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <MessageList messages={messages} />
      <MessageInput selectedUser={selectedUser ?? undefined} />
    </div>
  );
}
