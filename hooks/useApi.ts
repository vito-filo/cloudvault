import { useRouter } from "expo-router";
import { Platform } from "react-native";
import { useStorageState } from "./useStorageState";

// TODO load from environment variables or config file
let BASE_URL = "http://localhost:3000";
if (Platform.OS === "android") {
  BASE_URL = "http://10.0.2.2:3000";
}

export function useApi<T = any>(): {
  apiFetch: <T>(endpoint: string, options?: RequestInit) => Promise<T>;
} {
  const router = useRouter();
  const [[isLoading, session], setValue] = useStorageState("session");

  async function handleResponse(response: Response) {
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
  }

  async function apiFetch<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    //   const token = await getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      // ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    console.log("Sending request to:", `${BASE_URL}${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    return handleResponse(response);
  }

  return {
    apiFetch,
  };
}
