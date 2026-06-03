export interface User {
  id: string;
  name: string;
  online?: boolean;
}

export interface Message {
  id?: string;
  text: string;
  username: string;
  time: string;

  room?: string;

  from?: string; // socket id
  to?: string; // private chat uchun

  read?: boolean;
}
