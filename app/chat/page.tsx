"use client";
import { LoginModal } from "features/Auth/LoginModal/LoginModal";
import { useRoomsContext } from "hooks/useRoomsContext";
import { useUserContext } from "hooks/useUserContext";
import { Suspense } from "react";
import { ChatBody } from "./components/ChatBody";
import { ChatRoomList } from "./components/ChatRoomList";
import { LogPanel } from "./components/LogPanel";

export default function ChatLayout() {
  const { selectedChat } = useRoomsContext();
  const { user } = useUserContext();

  if (!user) {
    return <LoginModal />;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-900 leading-relaxed text-slate-400 selection:bg-teal-300 selection:text-teal-900">
      <div className="grid h-screen xl:max-h-screen 2xl:grid-cols-[1fr_3fr_1fr] grid-rows-[4fr_1fr] 2xl:grid-rows-1">
        <div
          className={`bg-slate-800 text-slate-200 border-r border-slate-600 ${
            selectedChat?.id ? "hidden 2xl:flex flex-col" : "flex flex-col"
          }`}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <ChatRoomList />
          </Suspense>
        </div>

        <div
          className={`bg-slate-900 text-slate-200 overflow-y-auto ${
            selectedChat?.id ? "block" : "hidden 2xl:block"
          }`}
        >
          <ChatBody />
        </div>

        <LogPanel />
      </div>
    </div>
  );
}
