import { IconSymbol } from "@/components/ui/IconSymbol";
import { useUserData } from "@/context/authContext";
import { useItemContext } from "@/context/ItemContext";
import { useApi } from "@/hooks/useApi";
import { PasswordItemList } from "@/types/password";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// TODO  change logo
const logo = {
  uri: "https://reactnative.dev/img/tiny_logo.png",
  width: 64,
  height: 64,
};

export default function PasswordCell({ item }: { item: PasswordItemList }) {
  const { setShouldRefresh } = useItemContext();
  const router = useRouter();
  const [userData, token] = useUserData();
  const { apiFetch } = useApi();

  const deletePassword = async (passwordId: number) => {
    try {
      await apiFetch(`/password/${userData.id}/${item.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "DELETE",
      });
      setShouldRefresh(true); // Trigger a refresh after deletion
    } catch (error) {
      Alert.alert("Error", "Failed to delete password.");
      console.error("Error deleting password:", error);
    }
  };

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

  const handlePress = async () => {
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
    <TouchableOpacity onPress={() => handlePress()}>
      <View style={styles.row}>
        <Image style={styles.icon} source={logo} />
        <Text style={styles.passwordName}>{item.serviceName}</Text>
        <TouchableOpacity onPress={() => deletePassword(item.id)}>
          <IconSymbol name="trash.fill" size={24} color="#ff0000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  passwordName: {
    marginRight: 10,
    // fontSize: 16, // Increase the font size to 16
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginVertical: 5,
    paddingHorizontal: 50,
    borderRadius: 5,
    elevation: 2, // Adds a shadow for Android
    shadowColor: "#000", // Adds a shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
});
