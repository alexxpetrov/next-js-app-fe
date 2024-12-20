"use client";
import { Tooltip } from "@components/Tooltip/Tooltip";
import { useContext, useState } from "react";
import { UserContext } from "../../../contexts/UserContext";
import { LoginModal } from "../LoginModal/LoginModal";

const Login = () => {
  const { user, logout } = useContext(UserContext);
  const [opened, setOpened] = useState(false);

  return (
    <>
      {user ? (
        <div className="flex items-center gap-4">
          <Tooltip
            title={
              <span className="text-slate-400">
                Authentication is managed by a dedicated Go Auth microservice,
                utilizing JWT auth strategy, with gRPC API for
                registration/login and token refresh. It supports both
                email/password login and biometric WebAuthn, with data securely
                stored in a standalone PostgreSQL database.
                <a
                  className="font-medium text-white hover:text-teal-300 focus-visible:text-teal-300"
                  rel="noreferrer noopener"
                  href="https://github.com/alexxpetrov/identia-be"
                  target="_blank"
                >
                  {" "}
                  GitHub
                </a>
              </span>
            }
          />
          <button
            className="bg-zinc-600 hover:bg-zinc-700 text-white font-semibold px-4 rounded-md focus:ring-2 focus:ring-zinc-300"
            onClick={logout}
          >
            Log out
          </button>
        </div>
      ) : (
        <button
          className="bg-zinc-600 hover:bg-zinc-700 text-white font-semibold px-4 rounded-md focus:ring-2 focus:ring-zinc-300"
          onClick={() => setOpened(true)}
        >
          Log in
        </button>
      )}
      {opened && <LoginModal />}
    </>
  );
};

export default Login;
