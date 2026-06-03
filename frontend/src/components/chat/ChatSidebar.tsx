import { List, Badge } from "antd";
import { useEffect, useState } from "react";
import { socket } from "../../api/socket";
import Title from "antd/es/typography/Title";
import type { User } from "../../types/chat";

type UserMap = Record<string, User>;

type SelectedUser = {
  id: string;
  name: string;
};

interface ChatSidebarProps {
  setSelectedUser: (user: SelectedUser) => void;
}

export default function ChatSidebar({ setSelectedUser }: ChatSidebarProps) {
  const [users, setUsers] = useState<UserMap>({});

  useEffect(() => {
    socket.on("users", (data: UserMap) => setUsers(data));
    console.log(users)

    return () => {
      socket.off("users");
    };
  }, []);

  return (
    <div style={{ padding: 10 }}>
      <Title>Users</Title>

      <List
        dataSource={Object.entries(users)}
        renderItem={([id, user]: [string, User]) => (
          <List.Item
            onClick={() => setSelectedUser({ id, name: user.name })}
            style={{ cursor: "pointer" }}
          >
            <Badge status="success" />
            <span style={{ marginLeft: 10 }}>{user.name}</span>
          </List.Item>
        )}
      />
    </div>
  );
}
