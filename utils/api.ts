// utils/api.ts

// import * as SecureStore from 'expo-secure-store';
import { Platform } from "react-native";

// TODO load from environment variables or config file
let BASE_URL = "http://localhost:3000";
if (Platform.OS === "android") {
  BASE_URL = "http://10.0.2.2:3000";
}

// async function getToken() {
//   return await SecureStore.getItemAsync('accessToken');
// }

async function handleResponse(response: Response) {
  const contentType = response.headers.get("Content-Type");
  const isJson = contentType?.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message = data?.message || "Something went wrong";
    throw new Error(message);
  }

  return data;
}

export async function apiFetch<T = any>(
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
