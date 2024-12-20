import { ChatContext } from "contexts/ChatContext";
import { useContext } from "react";

// Custom hook to use the UserContext
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a UserProvider");
  }
  return context;
};
