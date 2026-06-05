import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Input,
  Typography,
  Tooltip,
} from "antd";
import {
  SendOutlined,
  SmileOutlined,
  PaperClipOutlined,
  SearchOutlined,
  PushpinOutlined,
  DeleteOutlined,
  CloseOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";
import type { Chat, Message, User } from "../../types/chat";
import FileMessage from "./FileMessage";

const { Text } = Typography;

interface Props {
  currentUser: User;
  activeChat: Chat;
  messages: Message[];
  isTyping: boolean;
  users: User[];
  onSend: (text: string, file?: Message["file"]) => void;
  onTyping: () => void;
  onDelete: (msgId: number) => void;
  pinnedMessage: Message | null;
  onPin: (msg: Message) => void;
  onUnpin: () => void;
}

function StatusIcon({ status }: { status?: string }) {
  if (!status) return null;
  const color = status === "read" ? "#60a5fa" : "rgba(255,255,255,0.5)";
  const label = status === "sent" ? "✓" : "✓✓";
  return <span style={{ color, fontSize: 11 }}>{label}</span>;
}

export default function ChatWindow({
  currentUser,
  activeChat,
  messages,
  isTyping,
  users,
  onSend,
  onTyping,
  onDelete,
  pinnedMessage,
  onPin,
  onUnpin,
}: Props) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchIndex, setSearchIndex] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const msgRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchResults = searchText.trim()
    ? messages.reduce<number[]>((acc, msg, i) => {
        if (msg.text?.toLowerCase().includes(searchText.toLowerCase()))
          acc.push(i);
        return acc;
      }, [])
    : [];

  useEffect(() => {
    if (searchResults.length > 0) {
      msgRefs.current[searchResults[searchIndex]]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [searchIndex, searchText]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
    setShowEmoji(false);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const getUserName = (id: string) => {
    if (id === currentUser.id) return "Siz";
    return users.find((u) => u.id === id)?.username ?? id;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const fileData = await res.json();
      onSend("", fileData);
    } catch {
      alert("Fayl yuklanmadi");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Avatar
          size={40}
          style={{ backgroundColor: "#2563eb", fontWeight: 700, flexShrink: 0 }}
        >
          {activeChat.avatar}
        </Avatar>
        <div style={{ flex: 1 }}>
          <Text strong style={{ display: "block" }}>
            {activeChat.name}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {activeChat.isGroup ? "Guruh" : "Shaxsiy chat"}
          </Text>
        </div>
        <Tooltip title="Qidirish">
          <Button
            type={showSearch ? "primary" : "text"}
            icon={<SearchOutlined />}
            shape="circle"
            onClick={() => {
              setShowSearch((p) => !p);
              setSearchText("");
            }}
          />
        </Tooltip>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: "#f8f9fa",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Input
            autoFocus
            prefix={<SearchOutlined style={{ color: "#aaa" }} />}
            placeholder="Xabar qidirish..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setSearchIndex(0);
            }}
            style={{ borderRadius: 20 }}
          />
          {searchResults.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                flexShrink: 0,
              }}
            >
              <Text
                type="secondary"
                style={{ fontSize: 13, whiteSpace: "nowrap" }}
              >
                {searchIndex + 1}/{searchResults.length}
              </Text>
              <Button
                size="small"
                icon={<UpOutlined />}
                onClick={() => setSearchIndex((p) => Math.max(0, p - 1))}
              />
              <Button
                size="small"
                icon={<DownOutlined />}
                onClick={() =>
                  setSearchIndex((p) =>
                    Math.min(searchResults.length - 1, p + 1),
                  )
                }
              />
            </div>
          )}
          {searchText && searchResults.length === 0 && (
            <Text type="secondary" style={{ fontSize: 13, flexShrink: 0 }}>
              Topilmadi
            </Text>
          )}
        </div>
      )}

      {/* Pinlangan xabar */}
      {pinnedMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px",
            background: "#eff6ff",
            borderBottom: "1px solid #dbeafe",
            cursor: "pointer",
          }}
        >
          <PushpinOutlined style={{ color: "#2563eb", fontSize: 14 }} />
          <div style={{ flex: 1, overflow: "hidden" }}>
            <Text
              style={{
                fontSize: 11,
                color: "#2563eb",
                fontWeight: 600,
                display: "block",
              }}
            >
              Pinlangan xabar
            </Text>
            <Text
              ellipsis
              type="secondary"
              style={{ fontSize: 13, display: "block" }}
            >
              {pinnedMessage.text}
            </Text>
          </div>
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={onUnpin}
          />
        </div>
      )}

      {/* Xabarlar */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUser.id;
          const isHighlighted =
            searchResults[searchIndex] === index && searchText !== "";

          return (
            <div
              key={msg.id}
              ref={(el) => {
                msgRefs.current[index] = el;
              }}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                alignItems: "center",
                marginBottom: 8,
                borderRadius: 8,
                background: isHighlighted
                  ? "rgba(37,99,235,0.08)"
                  : "transparent",
                transition: "background 0.3s",
              }}
              onMouseEnter={() => setHoveredMsg(msg.id)}
              onMouseLeave={() => setHoveredMsg(null)}
            >
              {/* Hover tugmalari */}
              {isMe && hoveredMsg === msg.id && (
                <div style={{ display: "flex", gap: 4, marginRight: 6 }}>
                  <Tooltip title="Pin qilish">
                    <Button
                      size="small"
                      icon={<PushpinOutlined />}
                      onClick={() => onPin(msg)}
                      style={{
                        color: "#2563eb",
                        border: "none",
                        background: "#eff6ff",
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="O'chirish">
                    <Button
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => onDelete(msg.id)}
                      style={{
                        color: "#e74c3c",
                        border: "none",
                        background: "#fff1f0",
                      }}
                    />
                  </Tooltip>
                </div>
              )}

              <div
                style={{
                  maxWidth: "65%",
                  padding: "8px 12px",
                  borderRadius: 12,
                  fontSize: 14,
                  lineHeight: 1.4,
                  ...(isMe
                    ? {
                        background: "#2563eb",
                        color: "#fff",
                        borderBottomRightRadius: 2,
                      }
                    : {
                        background: "#fff",
                        color: "#222",
                        borderBottomLeftRadius: 2,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }),
                }}
              >
                {/* Guruhda kimdan */}
                {!isMe && activeChat.isGroup && (
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#2563eb",
                      display: "block",
                      marginBottom: 2,
                    }}
                  >
                    {getUserName(msg.senderId)}
                  </Text>
                )}

                {msg.file ? (
                  <FileMessage file={msg.file} isMe={isMe} />
                ) : (
                  <Text style={{ color: isMe ? "#fff" : "#222" }}>
                    {msg.text}
                  </Text>
                )}

                {/* Vaqt + status */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 3,
                    marginTop: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      color: isMe ? "rgba(255,255,255,0.7)" : "#aaa",
                    }}
                  >
                    {msg.time}
                  </Text>
                  {isMe && <StatusIcon status={msg.status} />}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <Text
            type="secondary"
            italic
            style={{ fontSize: 13, padding: "0 8px" }}
          >
            yozmoqda...
          </Text>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "10px 16px",
          background: "#fff",
          borderTop: "1px solid #f0f0f0",
          alignItems: "center",
        }}
      >
        {/* Fayl yuborish */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileUpload}
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
        />
        <Tooltip title="Fayl yuborish">
          <Button
            type="text"
            shape="circle"
            icon={<PaperClipOutlined />}
            loading={uploading}
            onClick={() => fileInputRef.current?.click()}
          />
        </Tooltip>

        {/* Emoji picker */}
        <div ref={emojiRef} style={{ position: "relative" }}>
          <Tooltip title="Emoji">
            <Button
              type="text"
              shape="circle"
              icon={<SmileOutlined />}
              onClick={() => setShowEmoji((prev) => !prev)}
            />
          </Tooltip>
          {showEmoji && (
            <div
              style={{ position: "absolute", bottom: 52, left: 0, zIndex: 100 }}
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                height={350}
                width={300}
              />
            </div>
          )}
        </div>

        <Input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTyping();
          }}
          onPressEnter={handleSend}
          placeholder="Xabar yozing..."
          variant="filled"
          style={{ borderRadius: 24 }}
        />

        <Button
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!text.trim()}
          size="large"
        />
      </div>
    </div>
  );
}
