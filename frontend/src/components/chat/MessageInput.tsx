import { Input, Button } from "antd";
import { useState } from "react";
import { socket } from "../../api/socket";
import { SendOutlined } from "@ant-design/icons";

type MessageInputProps = {
  selectedUserId?: string | null;
};

export default function MessageInput({ selectedUserId }: MessageInputProps) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;

    const data = {
      text,
      time: new Date().toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      targetId: selectedUserId ?? null,
    };

    socket.emit(selectedUserId ? "private_message" : "message", data);
    setText("");
  };

  return (
    <div
      style={{
        padding: "10px 12px",
        display: "flex",
        gap: 8,
        borderTop: "1px solid #f0f0f0",
      }}
    >
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Xabar yozing..."
        onPressEnter={send}
        size="large"
        variant="filled"
      />
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<SendOutlined />}
        onClick={send}
        disabled={!text.trim()}
      />
    </div>
  );
}
