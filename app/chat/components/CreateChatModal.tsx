import { ChatRoom } from "chat/types";
import { useState } from "react";
import { useChatFetchData } from "utils/chatFetcher";

export const CreateChatModal = ({
  onClose,
  onCreateChat,
}: {
  onClose: () => void;
  onCreateChat: (room: ChatRoom) => void;
}) => {
  const { protectedFetcher } = useChatFetchData();

  const [chatRoomName, setChatRoomName] = useState(""); // State for chat room name

  const handleCreateChat = async () => {
    if (chatRoomName.trim() === "") return;
    const newRoom = await protectedFetcher(`chat/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: { name: chatRoomName },
    })();
    onCreateChat(newRoom);
    setChatRoomName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 text-slate-200 rounded-md w-full max-w-md p-6 sm:p-8 md:max-w-lg lg:max-w-xl">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Create Chat Room
        </h2>
        <input
          autoFocus
          type="text"
          value={chatRoomName}
          onChange={(e) => setChatRoomName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCreateChat();
            }
          }}
          placeholder="Chat Room Name"
          className="w-full p-2 mb-4 bg-slate-800 text-slate-200 rounded-md outline-none focus:ring-2 focus:ring-teal-300"
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose} // Close the modal
            className="p-2 bg-slate-700 text-white rounded-md hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateChat} // Create the chat room
            className="p-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
