import { Tooltip } from "@components/Tooltip/Tooltip";
import Login from "features/Auth/Login/Login";
import { useRoomsContext } from "hooks/useRoomsContext";
import { useUserContext } from "hooks/useUserContext";
import { useMemo } from "react";
import { useUserService } from "services/userUserService";
import useSWR from "swr";

export const LogPanel = () => {
  const { getUserInfo } = useUserService();
  const { rooms } = useRoomsContext();

  const { user } = useUserContext();

  const { data: userInfo } = useSWR(
    user || null,
    () => getUserInfo({ userId: user!.id }),
    {
      // @ts-expect-error ignore
      fallbackData: {},
      refreshInterval: 5000,
    }
  );

  const lastMessageRoomName = useMemo(
    () => rooms.find(({ id }) => id == userInfo?.lastMessageRoomId)?.name,
    [rooms, userInfo?.lastMessageRoomId]
  );
  const lastJoinedRoomName = useMemo(
    () => rooms.find(({ id }) => id == userInfo?.joinedRoomId)?.name,
    [rooms, userInfo?.joinedRoomId]
  );

  return (
    <div
      className={`bg-slate-800 text-slate-200 border-t md:border-l border-slate-600`}
    >
      <div className="p-4 border-b border-slate-600 flex items-center gap-4 justify-between h-auto">
        <div className="flex items-center gap-4 justify-center">
          <span className="font-bold text-slate-200">Logs</span>
          <Tooltip
            title={
              <span className="text-slate-400">
                Logs are handled by a separate Go microservice. It uses an
                In-Memory database built on Sync.Map with Write-Ahead Logging to
                ensure speed and reliability. Client syncs data every 5 seconds
                via short-polling based gRPC request
                <a
                  className="font-medium text-white hover:text-teal-300 focus-visible:text-teal-300"
                  rel="noreferrer noopener"
                  href="https://github.com/alexxpetrov/erdtree"
                  target="_blank"
                >
                  {" "}
                  GitHub
                </a>
              </span>
            }
          />
        </div>
        <div>
          <Login />
        </div>
      </div>
      <div className="p-4 overflow-y-auto h-full text-sm text-slate-400 ">
        {userInfo?.loginTimestamp && (
          <div className="mb-2">
            Your login timestamp: {userInfo.loginTimestamp}
          </div>
        )}
        {userInfo?.registerTimestamp && (
          <div className="mb-2">
            Your registration timestamp: {userInfo.registerTimestamp}
          </div>
        )}
        {lastJoinedRoomName && (
          <div className="mb-2">Last joined room: {lastJoinedRoomName}</div>
        )}
        {userInfo?.lastMessage && (
          <div className="mb-2 overflow-hidden break-all">
            Last message: {userInfo.lastMessage} in {lastMessageRoomName} room
          </div>
        )}
      </div>
    </div>
  );
};
