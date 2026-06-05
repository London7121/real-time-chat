import { useEffect, useRef, useState } from "react";
import ChatWindow from "./ChatWindow";
import type { Chat, Message, User } from "../../types/chat";
import { socket } from "../../api/socket";
import Sidebar from "./Sidebar";
import { Layout, notification } from "antd";

interface Props {
  currentUser: User;
}

export default function ChatApp({ currentUser }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [onlineIds, setOnlineIds] = useState<string[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [typing, setTyping] = useState<Record<string, boolean>>({});
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({});
  const [pinnedMessages, setPinnedMessages] = useState<
    Record<string, Message | null>
  >({});

  const initialized = useRef(false);
  const usersRef = useRef<User[]>([]);
  const [notificationApi, contextHolder] = notification.useNotification();

  socket.on("connect", () => {
    console.log("CONNECTED", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("DISCONNECTED");
  });

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetch("http://localhost:5000/users")
      .then((r) => r.json())
      .then(({ users: u, group }) => {
        setUsers(u);
        usersRef.current = u;
        setActiveChat({
          id: group.id,
          name: group.name,
          avatar: "G",
          isGroup: true,
        });
      });

    socket.emit("user_online", currentUser.id);

    socket.on("online_users", (ids: string[]) => setOnlineIds(ids));

    socket.on("group_message", (msg: Message) => {
      setMessages((prev) => ({
        ...prev,
        group_general: [...(prev["group_general"] || []), msg],
      }));
      setLastMessages((prev) => ({ ...prev, group_general: msg.text }));
      setActiveChat((cur) => {
        if (cur?.id !== "group_general") {
          setUnread((prev) => ({
            ...prev,
            group_general: (prev["group_general"] || 0) + 1,
          }));
        }
        if (document.hidden && msg.senderId !== currentUser.id) {
          const senderName =
            usersRef.current.find((u) => u.id === msg.senderId)?.username ??
            "Kimdir";
          notificationApi.open({
            message: "General",
            description: `${senderName}: ${msg.text}`,
          });
        }
        return cur;
      });
    });

    socket.on("private_message", (msg: Message) => {
      const key = [msg.senderId, msg.receiverId].sort().join("_");
      setMessages((prev) => ({ ...prev, [key]: [...(prev[key] || []), msg] }));
      setLastMessages((prev) => ({ ...prev, [msg.senderId]: msg.text }));
      setActiveChat((cur) => {
        if (cur?.id !== msg.senderId) {
          setUnread((prev) => ({
            ...prev,
            [msg.senderId]: (prev[msg.senderId] || 0) + 1,
          }));
        }
        if (document.hidden) {
          const senderName =
            usersRef.current.find((u) => u.id === msg.senderId)?.username ??
            "Kimdir";
          notificationApi.open({ message: senderName, description: msg.text });
        }
        return cur;
      });
    });

    socket.on(
      "history",
      ({ chatId, messages: msgs }: { chatId: string; messages: Message[] }) => {
        setMessages((prev) => ({ ...prev, [chatId]: msgs }));
      },
    );

    socket.on("typing", ({ chatId }: { senderId: string; chatId: string }) => {
      setTyping((prev) => ({ ...prev, [chatId]: true }));
      setTimeout(
        () => setTyping((prev) => ({ ...prev, [chatId]: false })),
        1000,
      );
    });

    socket.on("message_delivered", ({ msgId }: { msgId: number }) => {
      setMessages((prev) => {
        const updated = { ...prev };
        for (const key in updated) {
          updated[key] = updated[key].map((m) =>
            m.id === msgId ? { ...m, status: "delivered" } : m,
          );
        }
        return updated;
      });
    });

    socket.on("message_read", ({ msgId }: { msgId: number }) => {
      setMessages((prev) => {
        const updated = { ...prev };
        for (const key in updated) {
          updated[key] = updated[key].map((m) =>
            m.id === msgId ? { ...m, status: "read" } : m,
          );
        }
        return updated;
      });
    });

    socket.on(
      "message_deleted",
      ({ msgId, chatId }: { msgId: number; chatId: string }) => {
        setMessages((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] || []).filter((m) => m.id !== msgId),
        }));
      },
    );

    socket.on(
      "pinned_message",
      ({ msg, chatId }: { msg: Message | null; chatId: string }) => {
        setPinnedMessages((prev) => ({ ...prev, [chatId]: msg }));
      },
    );

    return () => {
        socket.off("connect");
    socket.off("disconnect");
      socket.off("online_users");
      socket.off("group_message");
      socket.off("private_message");
      socket.off("history");
      socket.off("typing");
      socket.off("message_delivered");
      socket.off("message_read");
      socket.off("message_deleted");
      socket.off("pinned_message");
    };
  }, []);

  const openChat = (chat: Chat) => {
    setActiveChat(chat);
    setUnread((prev) => ({ ...prev, [chat.id]: 0 }));

    const chatId = chat.isGroup
      ? "group_general"
      : [currentUser.id, chat.id].sort().join("_");

    const chatMsgs = messages[chatId] || [];
    chatMsgs
      .filter((m) => m.senderId !== currentUser.id && m.status !== "read")
      .forEach((m) =>
        socket.emit("message_read", { msgId: m.id, senderId: m.senderId }),
      );

    if (chat.isGroup) {
      socket.emit("get_history", { type: "group" });
    } else {
      socket.emit("get_history", {
        type: "private",
        userId: currentUser.id,
        targetId: chat.id,
      });
    }
  };

  const sendMessage = (text: string, file?: Message["file"]) => {
    if (!activeChat) return;
    if (!text.trim() && !file) return;

    const msgData = { senderId: currentUser.id, text, file };
    if (activeChat.isGroup) {
      socket.emit("group_message", msgData);
    } else {
      socket.emit("private_message", { ...msgData, receiverId: activeChat.id });
    }
  };

  const sendTyping = () => {
    if (!activeChat) return;
    if (activeChat.isGroup) {
      socket.emit("typing", { type: "group", senderId: currentUser.id });
    } else {
      socket.emit("typing", {
        type: "private",
        senderId: currentUser.id,
        receiverId: activeChat.id,
      });
    }
  };

  const getChatId = (chat: Chat) =>
    chat.isGroup ? "group_general" : [currentUser.id, chat.id].sort().join("_");

  const deleteMessage = (msgId: number) => {
    if (!activeChat) return;
    socket.emit("delete_message", {
      msgId,
      chatId: getChatId(activeChat),
      isGroup: activeChat.isGroup,
      receiverId: activeChat.id,
    });
  };

  const pinMessage = (msg: Message) => {
    if (!activeChat) return;
    socket.emit("pin_message", {
      msg,
      chatId: getChatId(activeChat),
      isGroup: activeChat.isGroup,
      receiverId: activeChat.id,
    });
  };

  const unpinMessage = () => {
    if (!activeChat) return;
    socket.emit("unpin_message", {
      chatId: getChatId(activeChat),
      isGroup: activeChat.isGroup,
      receiverId: activeChat.id,
    });
  };

  const activeChatId = activeChat ? getChatId(activeChat) : "";
  const activeMsgs = messages[activeChatId] || [];
  const isTyping = typing[activeChatId] || false;

  console.log(messages);
  console.log(activeChatId);
  console.log(activeMsgs);

  return (
    <>
      {contextHolder}
      <div style={{ display: "flex", height: "100vh", background: "#f0f2f5" }}>
        <Sidebar
          currentUser={currentUser}
          users={users}
          onlineIds={onlineIds}
          activeChat={activeChat}
          onOpenChat={openChat}
          unread={unread}
          lastMessages={lastMessages}
        />
        {activeChat ? (
          <ChatWindow
            currentUser={currentUser}
            activeChat={activeChat}
            messages={activeMsgs}
            isTyping={isTyping}
            users={users}
            onSend={sendMessage}
            onTyping={sendTyping}
            onDelete={deleteMessage}
            pinnedMessage={pinnedMessages[activeChatId] || null}
            onPin={pinMessage}
            onUnpin={unpinMessage}
          />
        ) : (
          <Layout.Content
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#aaa",
            }}
          >
            Chatni tanlang
          </Layout.Content>
        )}
      </div>
    </>
  );
}
