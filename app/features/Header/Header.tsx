"use client";
import { useEffect } from "react";

import { useDispatch } from "react-redux";
import { actions } from "../../store/user/actions";
import Login from "../Auth/Login/Login";

// const headerItems = [
//   { key: "/", label: <Link href="/">Home</Link> },
//   { key: "/dashboard", label: <Link href="/dashboard">Dashboard</Link> },
//   { key: "/chat", label: <Link href="/chat">Chat</Link> },
//   { key: "/search", label: <Link href="/search">Search</Link> },
// ];

const AppHeader = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.init());
  }, [dispatch]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-cover bg-center backdrop-blur-lg">
      <div className="grid grid-cols-12 items-center px-4 py-2">
        <div className="col-span-4 text-left text-white text-lg font-bold">
          <ul className="flex flex-wrap gap-4">
            <li>Main</li>
            <li>Chat</li>
          </ul>
        </div>
        <div className="col-span-4 text-left text-white text-lg font-bold"></div>

        <div className="col-span-4 text-right text-gray-300 font-medium space-x-4">
          <Login />
        </div>
      </div>
      <div className="divide-solid"></div>
    </header>
  );
};

export default AppHeader;
