import PasswordCell from "@/components/PasswordCell";
import { useUserData } from "@/context/authContext";
import { useItemContext } from "@/context/ItemContext";
import { PasswordItemList } from "@/types/password";
import { apiFetch } from "@/utils/api";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function PasswordPage() {
  const [data, setData] = useState<PasswordItemList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { shouldRefresh, setShouldRefresh } = useItemContext();
  const userData = useUserData();

  useEffect(() => {
    fetchData();
    if (shouldRefresh) {
      fetchData();
      setShouldRefresh(false); // Reset the refresh state after fetching
    }
  }, [shouldRefresh, setShouldRefresh]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/password/${userData.id}`);
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
});
