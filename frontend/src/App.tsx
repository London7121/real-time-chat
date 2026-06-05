// import { useEffect, useRef, useState } from "react";
// import { socket } from "./api/socket";

// interface Message {
//   text: string;
//   username: string;
//   time: string;
//   room?: string;
//   targetId?: string;
// }

// function App() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [text, setText] = useState("");
//   const [username, setUsername] = useState("");
//   const [typingUser, setTypingUser] = useState("");
//   const [room, setRoom] = useState("General");
//   const [users, setUsers] = useState<Record<string, string>>({}); // ✅ Faqat string
//   const [selectedUser, setSelectedUser] = useState("");
//   const [joined, setJoined] = useState(false); // ✅ Join holati

//   const messageEndRef = useRef<HTMLDivElement | null>(null);
//   const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   // ======================
//   // REGISTER USER
//   // ======================
//   const joinChat = () => {
//     if (!username.trim()) return;
//     socket.emit("register", username);
//     socket.emit("join_room", room); // ✅ Avtomatik roomga kirish
//     setJoined(true);
//   };

//   // ======================
//   // JOIN ROOM
//   // ======================
//   const joinRoom = (newRoom: string) => {
//     setRoom(newRoom);
//     socket.emit("join_room", newRoom); // ✅ Room o'zgarganda avtomatik
//   };

//   // ======================
//   // SEND PUBLIC MESSAGE
//   // ======================
//   const sendMessage = () => {
//     if (!text.trim() || !username.trim()) return;

//     const messageData: Message = {
//       text,
//       username,
//       time: new Date().toLocaleTimeString().slice(0, 5),
//       room,
//     };

//     socket.emit("message", messageData);
//     // setMessages — O'CHIRING, backenddan qaytib keladi
//     setText("");
//   };

//   // ======================
//   // SEND PRIVATE MESSAGE
//   // ======================
//   const sendPrivateMessage = () => {
//     if (!text.trim() || !selectedUser) return;

//     const messageData: Message = {
//       text,
//       username,
//       time: new Date().toLocaleTimeString().slice(0, 5),
//       targetId: selectedUser,
//     };

//     socket.emit("private_message", messageData);
//     setMessages((prev) => [...prev, messageData]); // ✅ O'z private xabaringni ko'rsatish
//     setText("");
//   };

//   // ======================
//   // SOCKET LISTENERS
//   // ======================
//   useEffect(() => {
//     // ✅ Avval off, keyin on — ikki marta qo'shilmasligi uchun
//     socket.off("message").on("message", (data: Message) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     socket.off("private_message").on("private_message", (data: Message) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     socket.off("typing").on("typing", (user: string) => {
//       setTypingUser(user);
//       if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//       typingTimeoutRef.current = setTimeout(() => setTypingUser(""), 800);
//     });

//     socket.off("users").on("users", (data: Record<string, string>) => {
//       setUsers(data);
//     });

//     return () => {
//       socket.off("private_message");
//       socket.off("message");
//       socket.off("typing");
//       socket.off("users");
//     };
//   }, []);

//   // ======================
//   // AUTO SCROLL
//   // ======================
//   useEffect(() => {
//     messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // ======================
//   // RENDER
//   // ======================
//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Real Time Chat App</h2>

//       {/* JOIN */}
//       {!joined ? (
//         <div>
//           <input
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && joinChat()}
//             placeholder="Username"
//           />
//           <button onClick={joinChat}>Join Chat</button>
//         </div>
//       ) : (
//         <p>
//           <b>{username}</b> sifatida ulangansiz — <b>{room}</b> xonasida
//         </p>
//       )}

//       {/* USERS */}
//       <div>
//         <h3>Online Users</h3>
//         {Object.entries(users).map(([id, name]) => (
//           <div
//             key={id}
//             onClick={
//               () => setSelectedUser((prev) => (prev === id ? "" : id)) // ✅ Toggle — bosib bekor qilish
//             }
//             style={{
//               cursor: "pointer",
//               fontWeight: selectedUser === id ? "bold" : "normal",
//               color: selectedUser === id ? "blue" : "inherit",
//             }}
//           >
//             {name} {selectedUser === id ? "(private)" : ""}
//           </div>
//         ))}
//         {selectedUser && (
//           <button onClick={() => setSelectedUser("")}>
//             ✕ Private moddan chiqish
//           </button>
//         )}
//       </div>

//       {/* ROOM */}
//       <div>
//         <select
//           value={room}
//           onChange={(e) => joinRoom(e.target.value)} // ✅ O'zgarganda avtomatik join
//         >
//           <option value="General">General</option>
//           <option value="Support">Support</option>
//           <option value="Feedback">Feedback</option>
//         </select>
//       </div>

//       {/* TYPING */}
//       {typingUser && (
//         <p style={{ fontStyle: "italic", color: "gray" }}>
//           {typingUser} yozmoqda...
//         </p>
//       )}

//       {/* MESSAGES */}
//       <div
//         style={{
//           height: "300px",
//           overflowY: "auto",
//           border: "1px solid #ccc",
//           padding: "10px",
//           borderRadius: "8px",
//         }}
//       >
//         {messages.map((msg, index) => {
//           const isMe = msg.username === username;
//           const isPrivate = !!msg.targetId;

//           return (
//             <div
//               key={index}
//               style={{
//                 textAlign: isMe ? "right" : "left",
//                 marginBottom: "8px",
//                 color: isPrivate ? "purple" : "inherit", // ✅ Private xabar rangi
//               }}
//             >
//               <b>{msg.username}</b>
//               {isPrivate ? " 🔒" : ""}: {msg.text}{" "}
//               <span style={{ fontSize: "11px", color: "gray" }}>
//                 ({msg.time})
//               </span>
//             </div>
//           );
//         })}
//         <div ref={messageEndRef} />
//       </div>

//       {/* INPUT */}
//       <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
//         <input
//           value={text}
//           onChange={(e) => {
//             setText(e.target.value);
//             if (username.trim()) {
//               // ✅ faqat login bo'lgan bo'lsa
//               socket.emit("typing", username);
//             }
//           }}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               if (selectedUser) {
//                 sendPrivateMessage();
//               } else {
//                 sendMessage();
//               }
//             }
//           }}
//           placeholder={
//             selectedUser
//               ? `${users[selectedUser] ?? "User"} ga private xabar...`
//               : "Xabar yozing..."
//           }
//           style={{ flex: 1 }}
//         />
//         <button onClick={selectedUser ? sendPrivateMessage : sendMessage}>
//           {selectedUser ? "🔒 Yuborish" : "Yuborish"}
//         </button>
//       </div>
//     </div>
//   );
// }

// export default App;

import { useState } from "react";
import type { User } from "./types/chat";
import Login from "./components/login/Login";
import ChatApp from "./components/chat/ChatApp";
export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  console.log(currentUser)

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return <ChatApp currentUser={currentUser} />;
}
