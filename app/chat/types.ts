import { Dispatch, RefObject, SetStateAction } from "react";
import { KeyedMutator } from "swr";

export type ChatRoom = { id: string; name: string };

export type Message = {
  id: string;
  content: string;
  user_id: string;
  nickname: string;
  room_id: string;
  time_created: string;
  type: "recv" | "self";
};

export type ChatContextType = {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  scrollableRef: RefObject<HTMLDivElement | null>
};

export type RoomsContextType = {
  rooms: ChatRoom[];
  mutate: KeyedMutator<ChatRoom[]>;
  switchWebSocket: ({ id, name }: ChatRoom) => void;
  connectToWebSocket: (id: string) => void;
  selectedChat: ChatRoom | null;
  webSocketRef: RefObject<WebSocket | null>
  setSelectedChat: Dispatch<SetStateAction<ChatRoom | null>>
};
