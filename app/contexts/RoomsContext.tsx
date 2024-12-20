import { ChatRoom, RoomsContextType } from "chat/types";
import { useChatContext } from "hooks/useChatContext";
import { useUserContext } from "hooks/useUserContext";
import { createContext, RefObject, useCallback, useRef, useState } from "react";
import useSWR from "swr";
import { useChatFetchData } from "utils/chatFetcher";

export const RoomsContext = createContext<RoomsContextType>({
  rooms: [],
  mutate: () => new Promise(() => null),
  switchWebSocket: () => {},
  connectToWebSocket: () => {},
  selectedChat: {} as ChatRoom,
  webSocketRef: {} as RefObject<WebSocket | null>,
  setSelectedChat: () => {},
});

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const { protectedFetcher } = useChatFetchData();
  const { user } = useUserContext();
  const { setMessages, scrollableRef } = useChatContext();

  const { data: rooms = [], mutate } = useSWR<{ name: string; id: string }[]>(
    user?.id ? "chat/rooms" : null,
    protectedFetcher("chat/rooms", { method: "GET" }),
    {
      fallbackData: [],
    }
  );

  const webSocketRef = useRef<WebSocket | null>(null);

  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(
    {} as ChatRoom
  );

  // Open WebSocket connection
  const connectToWebSocket = useCallback(
    (id: string) => {
      const ws = new WebSocket(
        `wss://beef.alexspetrov.com/api/chat/rooms/${id}?access_token=${user?.accessToken}&user_id=${user?.id}&nickname=${user?.firstName}_${user?.lastName}`
      );

      if (ws.OPEN) {
        webSocketRef.current = ws;
      }

      ws.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        console.log("Message received from server:", JSON.parse(event.data));
        setMessages((prev) => [
          ...prev,
          ...(Array.isArray(parsedData) ? parsedData : [parsedData]).sort(
            // @ts-expect-error ignore
            (a, b) => new Date(a.time_created) - new Date(b.time_created)
          ),
        ]);

        const scrollableElement = scrollableRef.current;
        if (scrollableElement) {
          const previousHeight = scrollableElement.scrollHeight;
          setTimeout(() => {
            const newHeight = scrollableElement.scrollHeight;
            scrollableElement.scrollTop += newHeight - previousHeight;
          }, 0);
        }
      };

      // Event: Connection closed
      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.reason);
        setMessages([]);
      };

      // Event: Error occurred
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    },
    [setMessages, user, scrollableRef]
  );

  // Switch WebSocket connection
  const switchWebSocket = useCallback(
    ({ id, name }: ChatRoom) => {
      if (webSocketRef.current) {
        console.log("Closing WebSocket for chat:", selectedChat?.name);

        // Wait for the WebSocket to close
        webSocketRef.current.onclose = () => {
          setMessages([]);

          console.log("WebSocket closed. Opening new connection...");
          connectToWebSocket(id);
        };

        webSocketRef.current.close();
      } else {
        // No existing WebSocket, directly connect
        connectToWebSocket(id);
      }

      setSelectedChat({ id, name });
    },
    [selectedChat, setSelectedChat, connectToWebSocket, setMessages]
  );

  return (
    <RoomsContext.Provider
      value={{
        rooms,
        mutate,
        selectedChat,
        switchWebSocket,
        connectToWebSocket,
        webSocketRef,
        setSelectedChat,
      }}
    >
      {children}
    </RoomsContext.Provider>
  );
};
