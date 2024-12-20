import { Tooltip } from "@components/Tooltip/Tooltip";
import { useRoomsContext } from "hooks/useRoomsContext";
import { memo, useCallback, useMemo, useState } from "react";
import { mutate } from "swr";
import { CreateChatModal } from "./CreateChatModal";
import { SearchBar } from "./SearchBar";

/* eslint react/display-name: "off" */
export const ChatRoomList = memo(() => {
  const { selectedChat, switchWebSocket } = useRoomsContext();
  const { rooms } = useRoomsContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false); // State to toggle modal visibility

  const onSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleCreateChat = useCallback(
    (newRoom: { name: string; id: string }) => {
      mutate([...rooms, newRoom]); // Add the new chat room to the list
      switchWebSocket(newRoom);
    },
    [rooms, switchWebSocket]
  );

  const filteredChats = useMemo(
    () =>
      rooms.filter(({ name }) =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [rooms, searchQuery]
  );

  return (
    <>
      <SearchBar onChange={onSearchChange} />
      <div className="overflow-y-auto max-h-[calc(100vh-400px)] 2xl:max-h-screen overflow-hidden break-words">
        {filteredChats.length > 0 ? (
          filteredChats.map(({ id, name }) => (
            <div
              key={id}
              onClick={() => switchWebSocket({ id, name })}
              className={`p-4 cursor-pointer rounded-md hover:bg-slate-700 ${
                selectedChat?.id === id ? "bg-slate-700" : ""
              }`}
            >
              {name}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-slate-500">No chats found</div>
        )}
      </div>
      <div className="p-4 flex items-center gap-4">
        <button
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md focus:ring-2 focus:ring-teal-300"
          onClick={() => setShowModal(true)}
        >
          Create chat
        </button>
        <Tooltip
          title={
            <span className="text-slate-400">
              Chat rooms are managed by a Golang-based microservice. Data is
              fetched through a REST API and stored securely in a PostgreSQL
              database.
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
      {showModal && (
        <CreateChatModal
          onClose={() => setShowModal(false)}
          onCreateChat={handleCreateChat}
        />
      )}
    </>
  );
});
