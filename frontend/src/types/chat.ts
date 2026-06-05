export interface User {
  id: string;
  username: string;
  avatar: string;
  name: string;
  online: string;
}

export interface Message {
  id: number;
  senderId: string;
  receiverId?: string;
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
  file?: {
    url: string;
    name: string;
    type: string;
    size: number;
  };
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  isGroup: boolean;
}
