import { ServiceType } from "@bufbuild/protobuf";
import { createPromiseClient, PromiseClient, Transport } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { WEBAUTHN_ENDPOINT } from "../utils/config";

const transport = createConnectTransport({
  baseUrl: WEBAUTHN_ENDPOINT,
  credentials: "include",
});

export const useClient = <T extends ServiceType>(
  service: T,
  trans?: Transport
): PromiseClient<T> => {
  const client = createPromiseClient(service, trans ?? transport);

  return client;
};
