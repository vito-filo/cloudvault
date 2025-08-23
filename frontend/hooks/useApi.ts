import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useStorageState } from "./useStorageState";

let BASE_URL = process.env.EXPO_PUBLIC_API_URL;
// let BASE_URL = "http://localhost:3000";
// if (Platform.OS === "android") {
//   BASE_URL = "http://10.0.2.2:3000";
// }

export function useApi(): {
  apiFetch: <T>(endpoint: string, options?: RequestInit) => Promise<T>;
} {
  const router = useRouter();
  const [, setValue] = useStorageState("session");

  const handleResponse = useCallback(
    async (response: Response) => {
      const contentType = response.headers.get("Content-Type");
      const isJson = contentType?.includes("application/json");
      const data = isJson ? await response.json().catch(() => null) : null;

      if (response.status === 401) {
        // Unauthorized, delete session, redirect to login
        setValue(null);
        router.dismissTo("/login");
        throw new Error("Unauthorized access. Please log in again.");
      }
      if (!response.ok) {
        const message = data?.message || "Something went wrong";
        throw new Error(message);
      }

      return data;
    },
    [router, setValue]
  );

  const apiFetch = useCallback(
    async <T = any>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T> => {
      //   const token = await getToken();

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        // ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      };

      console.log(
        `Sending request ${options.method} to ${BASE_URL}${endpoint}`
      );
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      return handleResponse(response);
    },
    [handleResponse]
  );

  return {
    apiFetch,
  };
}
