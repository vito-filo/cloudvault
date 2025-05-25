// utils/api.ts

// import * as SecureStore from 'expo-secure-store';

const BASE_URL = "http://localhost:3000"; // ideally from env vars

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
