"use client";
import React, { ReactNode } from "react";
import { useAxiosInterceptor as useChatInterceptor } from "../utils/chatFetcher";
import { useAxiosInterceptor } from "../utils/fetcher";

const InterceptorHoc: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Add your logic or interceptors here
  useAxiosInterceptor();
  useChatInterceptor();

  return <>{children}</>;
};

export default InterceptorHoc;
