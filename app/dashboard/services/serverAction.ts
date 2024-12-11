"use server";
import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import { RegisterDtoType, User } from "../types/User";
import { ENDPOINT, IS_DEVELOPMENT, WEBAUTHN_ENDPOINT } from "../utils/config";
import { deleteAccessTokenCookie, setAccessTokenCookie } from "../utils/cookie";

import { ConnectError, createPromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { AuthService } from "@gen/auth/v1/auth_connect";
import { LoginResponse, RegisterResponse } from "@gen/auth/v1/auth_pb";
import { redirect } from "next/navigation";

const transport = createConnectTransport({
  baseUrl: WEBAUTHN_ENDPOINT,
  credentials: "include",
});

const client = createPromiseClient(AuthService, transport);

export const serverLogin = async (dto: RegisterDtoType): Promise<User> => {
  const data = (await client
    .login(dto)
    .then((res) => res)
    .catch((err) => {
      if (err instanceof ConnectError) {
        console.log(err.code); // Code.InvalidArgument
        console.log(err.message); // "[invalid_argument] sentence cannot be empty"
      }
      // Alternatively, we can use ConnectError.from()
      // It returns a ConnectError as is, and converts any
      // other error to a ConnectError.
      const connectErr = ConnectError.from(err);
      console.log(connectErr.code); // Code.InvalidArgument
      console.log(connectErr.message); // "[invalid_argument] sentence cannot be empty"
    })) as LoginResponse;

  if (!data.accessToken) {
    return {} as User;
  }

  if (IS_DEVELOPMENT) {
    setAccessTokenCookie(data.accessToken);
  }

  return {
    ...(jwtDecode(data.accessToken) as User),
    accessToken: data.accessToken,
  };
};

export const serverRegister = async (dto: RegisterDtoType): Promise<User> => {
  const data = (await client
    .register(dto)
    .then((res) => res)
    .catch((err) => {
      if (err instanceof ConnectError) {
        console.log(err.code); // Code.InvalidArgument
        console.log(err.message); // "[invalid_argument] sentence cannot be empty"
      }
      // Alternatively, we can use ConnectError.from()
      // It returns a ConnectError as is, and converts any
      // other error to a ConnectError.
      const connectErr = ConnectError.from(err);
      console.log(connectErr.code); // Code.InvalidArgument
      console.log(connectErr.message); // "[invalid_argument] sentence cannot be empty"
    })) as RegisterResponse;

  if (!data.accessToken) {
    return {} as User;
  }

  if (IS_DEVELOPMENT) {
    setAccessTokenCookie(data.accessToken);
  }

  return {
    ...(jwtDecode(data.accessToken) as User),
    accessToken: data.accessToken,
  };
};

export const serverLogout = async (dto: {accessToken: string}) => {
  const data = (await client
    .logout(dto)
    .then((res) => res)
    .catch((err) => {
      if (err instanceof ConnectError) {
        console.log(err.code); // Code.InvalidArgument
        console.log(err.message); // "[invalid_argument] sentence cannot be empty"
      }
      // Alternatively, we can use ConnectError.from()
      // It returns a ConnectError as is, and converts any
      // other error to a ConnectError.
      const connectErr = ConnectError.from(err);
      console.log(connectErr.code); // Code.InvalidArgument
      console.log(connectErr.message); // "[invalid_argument] sentence cannot be empty"
    }));

  if (!data?.ok) {
    return
  }

  if (IS_DEVELOPMENT) {
    deleteAccessTokenCookie();
  }

  redirect("/");
};

export const serverRefreshToken = async ({
  id,
}: {
  id: string;
}): Promise<User | null> => {
  try {
    const { data, status } = await axios.post(
      `${ENDPOINT}/api/refresh-token`,
      { id },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    if (status === 200) {
      setAccessTokenCookie(data.access_token);

      return {
        ...(jwtDecode(data.access_token) as User),
        accessToken: data.access_token,
      };
    } else {
      console.log("Token refresh failed");
      return null;
    }
  } catch (error) {
    console.log("Error occurred:", (error as AxiosError).message);
    return null;
  }
};
