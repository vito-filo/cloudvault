import { IconSymbol } from "@/components/ui/IconSymbol";
import { useItemContext } from "@/context/ItemContext";
import { PasswordItemList } from "@/types/password";
import { apiFetch } from "@/utils/api";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// TODO  change logo
const logo = {
  uri: "https://reactnative.dev/img/tiny_logo.png",
  width: 64,
  height: 64,
};

export default function PasswordCell({ item }: { item: PasswordItemList }) {
  const { setShouldRefresh } = useItemContext();

  const deletePassword = async (passwordId: number) => {
    try {
      const userId = 1; // Replace with actual user ID logic
      console.log("Deleting password with ID:", passwordId);
      await apiFetch(`/password/${userId}/${item.id}`, { method: "DELETE" });
      setShouldRefresh(true); // Trigger a refresh after deletion
    } catch (error) {
      console.error("Error deleting password:", error);
    }
  };

  return (
    <TouchableOpacity>
      <View style={styles.row}>
        <Image style={styles.icon} source={logo} />
        <Text style={styles.passwordName}>{item.serviceName}</Text>
        <TouchableOpacity onPress={() => deletePassword(item.id)}>
          <IconSymbol name="trash" size={24} color="#ff0000" />
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
