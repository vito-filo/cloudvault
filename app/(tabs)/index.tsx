import { ItemCell } from "@/components/ItemCell";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useUserData } from "@/context/authContext";
import { useItemContext } from "@/context/ItemContext";
import { useApi } from "@/hooks/useApi";
import { listStyle } from "@/styles/list";
import { PasswordItemList } from "@/types/password";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function PasswordPage() {
  const [data, setData] = useState<PasswordItemList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { itemListRefresh, setItemListRefresh } = useItemContext();
  const [userData, token] = useUserData();
  const { apiFetch } = useApi();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch<PasswordItemList[]>(
        `/password?userId=${userData.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          method: "GET",
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
    if (itemListRefresh) {
      fetchData();
      setItemListRefresh(false);
    }
  }, [fetchData, itemListRefresh, setItemListRefresh]);

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
            <Text>No password found.</Text>
            <Text>Use the Add (+) button to create a new password.</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            renderItem={({ item }) => (
              <ItemCell
                item={{ id: item.id, name: item.serviceName }}
                apiEndpoint={`/password/${userData.id}`}
                handlePress={() => handlePress(item)}
                triggerRefresh={() => setItemListRefresh(true)}
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
            router.navigate("/createPassword");
          }}
        >
          <IconSymbol size={28} name="plus.circle.fill" color={"black"} />
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
