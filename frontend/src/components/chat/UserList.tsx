import { List, Badge, Avatar } from "antd";
import type { User } from "../../types/chat";
import Title from "antd/es/typography/Title";

interface Props {
  users: Record<string, User>;
  selectedUser: User | null;
  setSelectedUser: (user: User) => void;
}

export default function UserList({
  users,
  selectedUser,
  setSelectedUser,
}: Props) {

    console.log("users", users)
  return (
    <div style={{ padding: 10 }}>
      <Title style={{ marginBottom: 10 }}>Users</Title>

      <List
        dataSource={Object.entries(users)}
        renderItem={([id, user]: [string, User]) => {
          const isActive = selectedUser?.id === id;

          return (
            <List.Item
              onClick={() => setSelectedUser({ ...user, id } as User)}
              style={{
                cursor: "pointer",
                background: isActive ? "#f0f5ff" : "transparent",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor: user.online ? "#52c41a" : "#d9d9d9",
                    }}
                  >
                    {user.name?.charAt(0)}
                  </Avatar>
                }
                title={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span>{user.name}</span>

                    <Badge status={user.online ? "success" : "default"} />
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    </div>
  );
}
