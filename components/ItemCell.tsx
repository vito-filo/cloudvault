import { IconSymbol } from "@/components/ui/IconSymbol";
import { useUserData } from "@/context/authContext";
import { useApi } from "@/hooks/useApi";
import { cellStyle } from "@/styles/cell";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

const logo = {
  uri: "https://reactnative.dev/img/tiny_logo.png",
  width: 64,
  height: 64,
};

type ItemCellProps = {
  item: { id: string; name: string };
  apiEndpoint: string;
  handlePress?: (item: any) => void;
};

export function ItemCell({ item, apiEndpoint, handlePress }: ItemCellProps) {
  const [, token] = useUserData();
  const { apiFetch } = useApi();

  const deleteItem = async (itemId: string) => {
    try {
      const response = (await apiFetch(`${apiEndpoint}/${item.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "DELETE",
      })) as Response;
      console.log("Delete response:", response);
      if (response?.ok) {
        Alert.alert("Success", "Password deleted successfully.");
        // Optionally, you can refresh the list or perform other actions here
      } else {
        const errorText = await response?.text();
        Alert.alert("Error", `Failed to delete password: ${errorText}`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete password.");
      console.error("Error deleting password:", error);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={cellStyle.row}>
        <Image style={cellStyle.icon} source={logo} />
        <Text style={cellStyle.name}>{item.name}</Text>
        <TouchableOpacity onPress={() => deleteItem(item.id)}>
          <IconSymbol name="trash.fill" size={24} color="#ff0000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
