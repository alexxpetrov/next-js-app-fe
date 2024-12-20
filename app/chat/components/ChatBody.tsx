import { Tooltip } from "@components/Tooltip/Tooltip";
import { useChatContext } from "hooks/useChatContext";
import { useRoomsContext } from "hooks/useRoomsContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { MessageList } from "./MessageList";

export const ChatBody = () => {
  const [message, setMessage] = useState<string>("");
  const { scrollableRef, messages } = useChatContext();
  const { webSocketRef, selectedChat, setSelectedChat } = useRoomsContext();

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    webSocketRef.current!.send(message);

    console.log("Message sent:", message);
    setMessage("");
  };

  const inputRef = useRef(null);

  const handleBlur = useCallback(() => {
    // Refocus the input if it loses focus
    if (inputRef.current) {
      (inputRef.current as HTMLInputElement).focus();
    }
  }, []);

  useEffect(() => {
    handleBlur();
  }, [messages, handleBlur]);

  if (!selectedChat?.id) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-slate-500">Select a chat to start messaging</span>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto,1fr,auto] h-full bg-gray-900 text-gray-200">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
        <div className="flex gap-4 z-10">
          <span className="font-semibold">{selectedChat.name}</span>
          <Tooltip
            title={
              <span className="text-slate-400">
                Chat messages are delivered in real-time using WebSocket
                connections served by a Go Http server. All messages are
                efficiently stored and retrieved from Redis cache or ScyllaDB
                database for high performance.
                <a
                  className="font-medium text-white hover:text-teal-300 focus-visible:text-teal-300"
                  rel="noreferrer noopener"
                  href="https://github.com/alexxpetrov/beef"
                  target="_blank"
                >
                  {" "}
                  GitHub
                </a>
              </span>
            }
          />
        </div>

        <button
          onClick={() => setSelectedChat(null)}
          className="text-gray-400 hover:text-teal-300"
        >
          Back
        </button>
      </div>

      {/* Chat Messages */}
      <div
        className="p-4 overflow-y-auto scroll-smooth space-y-4"
        ref={scrollableRef}
      >
        <MessageList />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="relative flex items-center">
          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            autoFocus
            placeholder="Type a message..."
            className="w-full pr-10 p-2 bg-gray-700 text-gray-200 rounded-md outline-none focus:ring-2 focus:ring-teal-300"
          />
          {/* Send Icon */}
          {message.trim() && (
            <button
              onClick={handleSendMessage}
              className="absolute right-2 text-gray-400 hover:text-teal-300"
            >
              <FiSend size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
