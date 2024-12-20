"use client";
import { ReactNode } from "react";
import { UserProvider } from "../contexts/UserContext";

const UserProviderWrapper = ({
  accessToken,
  children,
}: {
  children: ReactNode;
  accessToken: string;
}) => {
  return <UserProvider accessToken={accessToken}>{children}</UserProvider>;
};

export default UserProviderWrapper;
