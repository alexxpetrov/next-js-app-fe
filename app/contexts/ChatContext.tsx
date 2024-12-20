import { ChatContextType, Message } from "chat/types";
import { createContext, RefObject, useEffect, useRef, useState } from "react";

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  setMessages: () => {},
  scrollableRef: {} as RefObject<null>,
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const scrollableRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Scroll to the bottom on initial load
    const scrollableElement = scrollableRef.current;
    if (scrollableElement) {
      setTimeout(() => {
        scrollableElement.scrollTop = scrollableElement.scrollHeight;
      }, 0);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        scrollableRef,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
