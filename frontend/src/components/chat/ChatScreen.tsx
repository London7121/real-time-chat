import { Layout } from "antd";
import { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import type { User } from "../../types/chat";

const { Sider, Content } = Layout;

export default function ChatScreen({ username }: { username: string }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSetSelectedUser = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider width={300} style={{ background: "#fff" }}>
        <ChatSidebar setSelectedUser={handleSetSelectedUser} />
      </Sider>

      <Layout>
        <Content>
          <ChatWindow selectedUser={selectedUser} username={username} />
        </Content>
      </Layout>
    </Layout>
  );
}