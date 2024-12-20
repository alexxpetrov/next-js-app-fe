"use client";
import { LoginModal } from "dashboard/features/Auth/LoginModal/LoginModal";
import { useChatFetchData } from "dashboard/utils/chatFetcher";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useUserContext } from "../dashboard/hooks/useUserContext";
import { ChatBody } from "./components/ChatBody";
import { ChatList } from "./components/ChatList";
import { LogPanel } from "./components/LogPanel";
import { ChatRoom, Message } from "./types";

export default function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useUserContext();
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(
    {} as ChatRoom
  );
  const scrollableRef = useRef<HTMLDivElement | null>(null);

  const { protectedFetcher } = useChatFetchData();

  const { data: rooms = [], mutate } = useSWR<{ name: string; id: string }[]>(
    user?.id ? "chat/rooms" : null,
    protectedFetcher("chat/rooms", { method: "GET" }),
    {
      fallbackData: [],
    }
  );

  useEffect(() => {
    // Scroll to the bottom on initial load
    const scrollableElement = scrollableRef.current;
    if (scrollableElement) {
      setTimeout(() => {
        scrollableElement.scrollTop = scrollableElement.scrollHeight;
      }, 0);
    }
  }, [messages]);

  const webSocketRef = useRef<WebSocket | null>(null);

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
    [setMessages, user]
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
    [selectedChat, setSelectedChat, connectToWebSocket]
  );

  return (
    <div className="min-h-screen overflow-hidden bg-slate-900 leading-relaxed text-slate-400 selection:bg-teal-300 selection:text-teal-900">
      <div className="grid h-screen xl:max-h-screen 2xl:grid-cols-[1fr_3fr_1fr] grid-rows-[4fr_1fr] 2xl:grid-rows-1">
        {!user && <LoginModal />}
        <div
          className={`bg-slate-800 text-slate-200 border-r border-slate-600 ${
            selectedChat?.id ? "hidden 2xl:flex flex-col" : "flex flex-col"
          }`}
        >
          <ChatList
            switchWebSocket={switchWebSocket}
            selectedChat={selectedChat}
            rooms={rooms}
            mutate={mutate}
          />
        </div>

        <div
          className={`bg-slate-900 text-slate-200 overflow-y-auto ${
            selectedChat?.id ? "block" : "hidden 2xl:block"
          }`}
        >
          <ChatBody
            {...{
              setSelectedChat,
              selectedChat,
              messages: messages.length ? messages : [],
              userId: user?.id,
              webSocketRef,
              scrollableRef,
            }}
          />
        </div>

        <LogPanel rooms={rooms} />
      </div>
    </div>
  );
}
