import { Input, Button } from "antd";
import { useState } from "react";
import { socket } from "../../api/socket";
import { SendOutlined } from "@ant-design/icons";

type SelectedUser = {
  id?: string | null;
};

type MessageInputProps = {
  selectedUser?: SelectedUser;
};

export default function MessageInput({ selectedUser }: MessageInputProps) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;

    const data = {
      text,
      username: "Me",
      time: new Date().toLocaleTimeString().slice(0, 5),
      targetId: selectedUser?.id,
    };

    if (selectedUser) {
      socket.emit("private_message", data);
    } else {
      socket.emit("message", data);
    }

    setText("");
  };

  return (
    <div style={{ padding: 10, display: "flex", gap: 10 }}>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message..."
        onPressEnter={send}
      />

      <Button shape="round" type="primary" onClick={send} icon={<SendOutlined />}></Button>
    </div>
  );
}
