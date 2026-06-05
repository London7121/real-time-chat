import { useState } from "react";
import { Avatar, Badge, List, Typography, Divider } from "antd";
import type { Chat, User } from "../../types/chat";
import Profile from "./Profile";

const { Text } = Typography;

interface Props {
  currentUser: User;
  users: User[];
  onlineIds: string[];
  activeChat: Chat | null;
  unread: Record<string, number>;
  lastMessages: Record<string, string>;
  onOpenChat: (chat: Chat) => void;
}

export default function Sidebar({
  currentUser,
  users,
  onlineIds,
  activeChat,
  unread,
  lastMessages,
  onOpenChat,
}: Props) {
  const others = users.filter((u) => u.id !== currentUser.id);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div
      style={{
        width: 280,
        background: "#fff",
        borderRight: "1px solid #f0f0f0",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Profil */}
      <div
        onClick={() => setShowProfile(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background: "#f8f9fa",
          cursor: "pointer",
        }}
      >
        <Badge dot status="success" offset={[-4, 34]}>
          <Avatar
            style={{ backgroundColor: "#2563eb", fontWeight: 700 }}
            size={40}
          >
            {currentUser.avatar}
          </Avatar>
        </Badge>
        <div>
          <Text strong style={{ display: "block" }}>
            {currentUser.username}
          </Text>
          <Text type="success" style={{ fontSize: 12 }}>
            online
          </Text>
        </div>
      </div>

      {showProfile && (
        <Profile user={currentUser} onClose={() => setShowProfile(false)} />
      )}

      <Divider style={{ margin: "4px 0" }} />

      {/* Guruh */}
      <List.Item
        onClick={() =>
          onOpenChat({
            id: "group_general",
            name: "General",
            avatar: "G",
            isGroup: true,
          })
        }
        style={{
          cursor: "pointer",
          background:
            activeChat?.id === "group_general" ? "#e9f5ff" : "transparent",
          borderRadius: 8,
          margin: "2px 8px",
          padding: "10px 16px",
          border: "none",
        }}
      >
        <List.Item.Meta
          avatar={
            <Avatar
              style={{ backgroundColor: "#2563eb", fontWeight: 700 }}
              size={40}
            >
              G
            </Avatar>
          }
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text strong>General</Text>
              {(unread["group_general"] || 0) > 0 && (
                <Badge count={unread["group_general"]} size="small" />
              )}
            </div>
          }
          description={
            <Text
              type="secondary"
              ellipsis
              style={{ fontSize: 12, maxWidth: 160, display: "block" }}
            >
              {lastMessages["group_general"] || "Umumiy guruh"}
            </Text>
          }
        />
      </List.Item>

      <Divider style={{ margin: "4px 0" }} />

      <Text
        type="secondary"
        style={{
          padding: "8px 16px",
          fontSize: 12,
          fontWeight: 600,
          display: "block",
        }}
      >
        KONTAKTLAR
      </Text>

      {/* Foydalanuvchilar */}
      <List
        dataSource={others}
        rowKey={(u) => u.id}
        renderItem={(u) => {
          const isOnline = onlineIds.includes(u.id);
          const isActive = activeChat?.id === u.id;
          const badgeCount = unread[u.id] || 0;

          return (
            <List.Item
              onClick={() =>
                onOpenChat({
                  id: u.id,
                  name: u.username,
                  avatar: u.avatar,
                  isGroup: false,
                })
              }
              style={{
                cursor: "pointer",
                background: isActive ? "#e9f5ff" : "transparent",
                borderRadius: 8,
                margin: "2px 8px",
                padding: "10px 16px",
                border: "none",
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge
                    dot
                    status={isOnline ? "success" : "default"}
                    offset={[-4, 34]}
                  >
                    <Avatar
                      style={{ backgroundColor: "#2563eb", fontWeight: 700 }}
                      size={40}
                    >
                      {u.avatar}
                    </Avatar>
                  </Badge>
                }
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text strong={isActive}>{u.username}</Text>
                    {badgeCount > 0 && (
                      <Badge count={badgeCount} size="small" />
                    )}
                  </div>
                }
                description={
                  <Text
                    type="secondary"
                    ellipsis
                    style={{ fontSize: 12, maxWidth: 160, display: "block" }}
                  >
                    {lastMessages[u.id] || ""}
                  </Text>
                }
              />
            </List.Item>
          );
        }}
      />
    </div>
  );
}
