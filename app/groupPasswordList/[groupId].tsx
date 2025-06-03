import { ItemCell } from "@/components/ItemCell";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useUserData } from "@/context/authContext";
import { useApi } from "@/hooks/useApi";
import { listStyle } from "@/styles/list";
import { PasswordItemList } from "@/types/password";
import * as LocalAuthentication from "expo-local-authentication";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// This component fetches and displays a list of passwords for a specific group.

export default function GroupPasswordList() {
  const { groupId, groupName, userId } = useLocalSearchParams<{
    groupId: string;
    groupName: string;
    userId: string;
  }>();
  const navigation = useNavigation();

  const [data, setData] = useState<PasswordItemList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, token] = useUserData();
  const { apiFetch } = useApi();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch<PasswordItemList[]>(
        `/password?userId=${userData.id}&groupId=${groupId}`,
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
  }, [apiFetch, userData.id, token, groupId]);

  useEffect(() => {
    navigation.setOptions({
      title: groupName || "Detail",
      headerBackTitle: "Back",
    });
    fetchData();
  }, [fetchData, groupName, navigation]);

  const handleBiometricAuth = async (): Promise<boolean> => {
    // If device doesn't have biometric hardware biometrics are not enrolled, use passcode to authenticate.
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to continue",
      fallbackLabel: "Use Passcode", // Optional
    });

    if (result.success) {
      return true;
    } else {
      Alert.alert("Authentication failed", result.error || "Try again");
      return false;
    }
  };

  const handlePress = async (item: PasswordItemList) => {
    try {
      const isAuth = await handleBiometricAuth();
      if (isAuth) {
        router.push({
          pathname: "/passwordDetails/[id]",
          params: { id: item.id, name: item.serviceName },
        });
      }
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
          <Text>Error: {error}</Text>
        ) : (
          <FlatList
            data={data}
            renderItem={({ item }) => (
              <ItemCell
                item={{ id: item.id, name: item.serviceName }}
                apiEndpoint={`password/${userId}/${item.id}`}
                handlePress={() => handlePress(item)}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            refreshing={loading}
            onRefresh={fetchData}
          />
        )}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            router.navigate({
              pathname: "/createGroup",
              params: {
                groupIdParam: groupId,
                groupNameParam: groupName,
              },
            });
          }}
        >
          <IconSymbol size={28} name="ellipsis.circle.fill" color={"black"} />
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  addButton: {
    position: "absolute",
    bottom: 80,
    right: 30,
    width: 55,
    height: 55,
    backgroundColor: "#FF3F33",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
