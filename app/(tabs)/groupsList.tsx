import { ItemCell } from "@/components/ItemCell";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useUserData } from "@/context/authContext";
import { useItemContext } from "@/context/ItemContext";
import { useApi } from "@/hooks/useApi";
import { listStyle } from "@/styles/list";
import { GroupList } from "@/types/group";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// This component fetches and displays a list of groups for the user.

export default function GroupsList() {
  const { apiFetch } = useApi();
  const [userData, token] = useUserData();
  const [data, setData] = useState<GroupList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { gorupListRefresh, setGroupListRefresh } = useItemContext();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch<GroupList[]>(`/group/${userData.id}`, {
        method: "GET",
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
    if (gorupListRefresh) {
      fetchData();
      setGroupListRefresh(false);
    }
  }, [fetchData, gorupListRefresh, setGroupListRefresh]);

  const handlePress = async (item: GroupList) => {
    try {
      router.push({
        pathname: "/groupPasswordList/[groupId]",
        params: { groupId: item.id, userId: userData.id, groupName: item.name },
      });
    } catch (error) {
      console.error("Error during password cell press:", error);
      Alert.alert("Error", "Failed to get password details.");
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={listStyle.container}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>Error reaching the server</Text>
            <Text>please try again</Text>
          </View>
        ) : data.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>No gorup found.</Text>
            <Text>Use the Add (+) button to create a new group.</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            renderItem={({ item }) => (
              <ItemCell
                item={{ id: item.id, name: item.name }}
                apiEndpoint={`/group/${userData.id}`}
                handlePress={() => handlePress(item)}
                triggerRefresh={() => setGroupListRefresh(true)}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            // extraData={selectedId}
            refreshing={loading}
            onRefresh={fetchData}
          />
        )}
        <TouchableOpacity
          style={listStyle.addButton}
          onPress={() => {
            router.navigate("/createGroup");
          }}
        >
          <IconSymbol
            size={28}
            name="plus.square.fill.on.square.fill"
            color={"black"}
          />
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
