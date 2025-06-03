import { ItemCell } from "@/components/ItemCell";
import { useUserData } from "@/context/authContext";
import { useApi } from "@/hooks/useApi";
import { listStyle } from "@/styles/list";
import { GroupList } from "@/types/group";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function GroupsPage() {
  const { apiFetch } = useApi();
  const [userData, token] = useUserData();
  const [data, setData] = useState<GroupList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch<GroupList[]>(`/group/${userData.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setData(response);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [apiFetch, token, userData.id]);

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
            renderItem={({ item }) => (
              <ItemCell
                item={{ id: item.id, name: item.name }}
                apiEndpoint={`/group/${userData.id}`}
              />
            )}
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
