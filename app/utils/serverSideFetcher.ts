import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { User } from "../types/user";
import { ENDPOINT } from "./config";

// Create a reusable Axios instance with withCredentials: true for cookies
export const ssrAxiosInstance = axios.create({
  baseURL: `${ENDPOINT}/api`, // Your API base URL
  timeout: 5000,
});

// Define the structure of a retry queue item
interface RetryQueueItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (value?: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (error?: any) => void;
  config: AxiosRequestConfig;
}

// Add global request interceptor
ssrAxiosInstance.interceptors.request.use(
  async (config) => {
    // Modify request config here, e.g., add headers
    if (!config.headers?.Authorization && config.url !== "/refresh-token") {
      const accessToken = await refreshAccessToken(); // Get the access token via the refresh token

      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to refresh the access token using the refresh token stored in cookies
const refreshAccessToken = async () => {
  const accessTokenCookie = (await cookies()).get("access_token")!.value;
  const tokenUserData = jwtDecode(accessTokenCookie) as User;

  try {
    const response = await ssrAxiosInstance("/refresh-token", {
      method: "POST",
      data: { id: tokenUserData.id },
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data.access_token;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const subscribeSSRInterceptor = () => {
  // Create a list to hold the request queue
  const refreshAndRetryQueue: RetryQueueItem[] = [];
  // @TODO: Add logout functionality when both accesstoken/refreshtoken have expired.

  // Flag to prevent multiple token refresh requests
  let isRefreshing = false;

  ssrAxiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest: AxiosRequestConfig = error.config;
      if (
        error.response &&
        error.response.status === 401 &&
        error.config.url !== "/refresh-token"
      ) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            // Refresh the access token
            const newAccessToken = await refreshAccessToken();
            // Update the request headers with the new access token
            error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;

            // Retry all requests in the queue with the new token
            refreshAndRetryQueue.forEach(({ config, resolve, reject }) => {
              ssrAxiosInstance
                .request(config)
                .then((response) => resolve(response))
                .catch((err) => reject(err));
            });

            // Clear the queue
            refreshAndRetryQueue.length = 0;

            // Retry the original request
            return ssrAxiosInstance(originalRequest);
          } finally {
            isRefreshing = false;
          }
        }

        // Add the original request to the queue
        return new Promise<void>((resolve, reject) => {
          refreshAndRetryQueue.push({
            config: originalRequest,
            resolve,
            reject,
          });
        });
      }

      // @TODO: Add logout functionality when both accesstoken/refreshtoken have expired.
      // setUser(null);

      // Return a Promise rejection if the status code is not 401
      return Promise.reject(error);
    }
  );
};

export const useSSRFetch = () => {
  // Main request function that manages access tokens and retries failed requests
  const protectedFetcher = async (url: string, config: AxiosRequestConfig) => {
    const accessTokenCookie = (await cookies()).get("access_token")?.value;
    // Make the API request using ssrAxiosInstance
    try {
      const response = await ssrAxiosInstance(url, {
        ...config,
        method: "GET",
        headers: { Authorization: `Bearer ${accessTokenCookie}` },
      });

      return response.data; // If request succeeds, return the data
    } catch (error) {
      console.error("Error during protected fetch:", (error as AxiosError).message);
    }
  };

  const fetcher =
    ({ url }: { url: string }) =>
    async () => {
      try {
        const apiResponse = await ssrAxiosInstance.get(url);

        const result = apiResponse.data;
        return result;
      } catch (error) {
        console.log("Error occurred:", (error as AxiosError).message);
        return;
      }
    };

  return { protectedFetcher, fetcher };
};
