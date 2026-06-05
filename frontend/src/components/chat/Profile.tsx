import { Modal, Avatar, Badge, Typography, Divider, Tooltip } from "antd";
import type { User } from "../../types/chat";

const { Title, Text } = Typography;

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c"];

interface Props {
  user: User;
  onClose: () => void;
}

export default function Profile({ user, onClose }: Props) {
  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      centered
      width={340}
      styles={{ body: { padding: "24px 28px 16px" } }}
    >
      {/* Avatar */}
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}
      >
        <Badge dot status="success" offset={[-8, 68]}>
          <Avatar
            size={80}
            style={{
              backgroundColor: "#2563eb",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            {user.avatar}
          </Avatar>
        </Badge>
      </div>

      {/* Ism + status */}
      <Title level={4} style={{ textAlign: "center", marginBottom: 2 }}>
        {user.username}
      </Title>
      <Text
        type="success"
        style={{ display: "block", textAlign: "center", marginBottom: 20 }}
      >
        online
      </Text>

      <Divider style={{ margin: "0 0 12px" }} />

      {/* Info qatorlar */}
      {[
        { label: "Username", value: user.username },
        { label: "ID", value: `#${user.id}`, muted: true },
        { label: "Parol", value: "••••", muted: true },
      ].map(({ label, value, muted }) => (
        <div
          key={label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 0",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Text type="secondary" style={{ fontSize: 14 }}>
            {label}
          </Text>
          <Text type={muted ? "secondary" : undefined} style={{ fontSize: 14 }}>
            {value}
          </Text>
        </div>
      ))}

      {/* Rang tanlash */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 0",
        }}
      >
        <Text type="secondary" style={{ fontSize: 14 }}>
          Avatar rangi
        </Text>
        <div style={{ display: "flex", gap: 8 }}>
          {COLORS.map((c) => (
            <Tooltip key={c} title={c}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: c,
                  cursor: "pointer",
                  border: "2px solid transparent",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
            </Tooltip>
          ))}
        </div>
      </div>
    </Modal>
  );
}
