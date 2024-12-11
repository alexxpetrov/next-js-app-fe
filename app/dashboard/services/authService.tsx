import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import { RegisterDtoType, User } from "../types/User";
import { ENDPOINT } from "../utils/config";

export const authService = {
  register: async ({
    firstName,
    lastName,
    email,
    password,
  }: RegisterDtoType): Promise<User & { error?: string }> => {
    const { data } = await axios
      .post(
        `${ENDPOINT}/api/register`,
        {
          firstName,
          lastName,
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      )
      .catch((err) => {
        return { data: err.response.data };
      });

    if (data.error) {
      return data;
    }

    return {
      ...(jwtDecode(data.access_token) as User),
      accessToken: data.access_token,
    };
  },

  logout: async ({ accessToken }: { accessToken: string }) => {
    return axios.post(
      `${ENDPOINT}/api/logout`,
      { accessToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
  },

  fetchCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await axios.post(`${ENDPOINT}/api/refresh-token`, null, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        const data = response.data;
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
  },
};
