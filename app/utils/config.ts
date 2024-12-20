import "../../envConfig.ts";

export const ENDPOINT = process.env.NEXT_PUBLIC_HOST || "http://localhost:4500";
export const WEBAUTHN_ENDPOINT =
  process.env.NEXT_PUBLIC_WEBAUTHN_ENDPOINT || "http://localhost:4500";
export const CHAT_ENDPOINT =
  process.env.NEXT_PUBLIC_CHAT_ENDPOINT || "http://localhost:4000";
export const CHAT_GRPC_ENDPOINT =
  process.env.NEXT_PUBLIC_CHAT_GRPC_ENDPOINT || "http://localhost:4600";
export const ENVIRONMENT = process.env.NEXT_PUBLIC_ENV || "development";
export const IS_DEVELOPMENT = ENVIRONMENT === "development";
