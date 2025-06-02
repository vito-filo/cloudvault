import PasswordCell from "@/components/PasswordCell";
import { useUserData } from "@/context/authContext";
import { useApi } from "@/hooks/useApi";
import { listStyle } from "@/styles/list";
import { PasswordItemList } from "@/types/password";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function PasswordPage() {
  const [data, setData] = useState<PasswordItemList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, token] = useUserData();
  const { apiFetch } = useApi();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch<PasswordItemList[]>(
        `/password/${userData.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [apiFetch, userData.id, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={listStyle.container}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <Text>Error: {error}</Text>
        ) : (
          <FlatList
            data={data}
            renderItem={({ item }) => <PasswordCell item={item} />}
            keyExtractor={(item) => item.id.toString()}
            // extraData={selectedId}
            refreshing={loading}
            onRefresh={fetchData}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
