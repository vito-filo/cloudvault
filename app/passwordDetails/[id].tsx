import { IconSymbol } from "@/components/ui/IconSymbol";
import { useUserData } from "@/context/authContext";
import { useItemContext } from "@/context/ItemContext";
import { useApi } from "@/hooks/useApi";
import { PasswordInput, PasswordUpdate } from "@/types/password";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useReducer, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function reducer(
  state: PasswordUpdate,
  action: { key: string; value: string; default: string | undefined }
) {
  // Set updateData only if the value is different from the fetched data
  return {
    ...state,
    [action.key]: action.value !== action.default ? action.value : "",
  };
}

export default function PasswordDetail() {
  const { apiFetch } = useApi();
  const [data, setData] = useState<PasswordInput | null>(null);
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, token] = useUserData();
  const { setItemListRefresh } = useItemContext();
  const [updatedData, setUpdatedData] = useReducer(reducer, {});
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiFetch<PasswordInput>(
          `/password/${userData.id}/${id}`,
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
    };

    navigation.setOptions({
      title: name || "Detail",
      headerBackTitle: "Back",
    });
    fetchData();
  }, [name, navigation, id, userData.id, apiFetch, token]);

  async function handleUpdate() {
    const isEmpty = Object.values(updatedData).every((value) => value === "");
    if (isEmpty) {
      Alert.alert("No changes made", "Please update at least one field.");
      return;
    }

    try {
      const response = await apiFetch(`/password/${userData.id}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (response) {
        Alert.alert("Success", "Password details updated successfully.");
        setData({
          serviceName: updatedData.serviceName || data?.serviceName || "",
          password: updatedData.password || data?.password || "",
          username: updatedData.username || data?.username || "",
          email: updatedData.email || data?.email || "",
          url: updatedData.url || data?.url || "",
          description: updatedData.description || data?.description || "",
        });
        setItemListRefresh(true);
        router.back();
      } else {
        Alert.alert("Error", "Failed to update password details.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  }

  async function copyToClipboard(text: string) {
    await Clipboard.setStringAsync(text);
    console.log("Copied to clipboard:", text);
  }

  const _copyableInput = (key: keyof PasswordInput) => {
    const dataValue = data ? data[key] || "" : "";
    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.clipdoardInput}
          defaultValue={dataValue}
          onChangeText={(text) =>
            setUpdatedData({
              key: key,
              value: text,
              default: dataValue,
            })
          }
        />
        <TouchableOpacity
          style={styles.copyButton}
          onPress={() => copyToClipboard(updatedData.password || dataValue)}
        >
          <IconSymbol
            style={styles.copyButton}
            // size={10}
            name="doc.on.clipboard.fill"
            color={"black"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      {data && !loading ? (
        <View style={{ padding: 20 }}>
          <Text style={{ fontWeight: "bold" }}>Service Name:</Text>
          {/* <Text style={{ marginBottom: 20 }}>{data.serviceName}</Text> */}
          <TextInput
            style={styles.input}
            defaultValue={data.serviceName}
            onChangeText={(text) =>
              setUpdatedData({
                key: "serviceName",
                value: text,
                default: data.serviceName,
              })
            }
          />

          <Text style={{ fontWeight: "bold" }}>Password:</Text>
          {_copyableInput("password")}

          <Text style={{ fontWeight: "bold" }}>Username:</Text>
          {_copyableInput("username")}

          <Text style={{ fontWeight: "bold" }}>Email:</Text>
          {_copyableInput("email")}

          <Text style={{ fontWeight: "bold" }}>URL:</Text>
          <TextInput
            style={styles.input}
            defaultValue={data.url}
            onChangeText={(text) =>
              setUpdatedData({ key: "url", value: text, default: data.url })
            }
          />

          <Text style={{ fontWeight: "bold" }}>Description:</Text>
          <TextInput
            style={styles.input}
            defaultValue={data.description}
            onChangeText={(text) =>
              setUpdatedData({
                key: "description",
                value: text,
                default: data.description,
              })
            }
          />
          <Pressable style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>UPDATE</Text>
          </Pressable>
        </View>
      ) : loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>Error: {error}</Text>
      ) : (
        <Text>No data found</Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 7,
  },
  clipdoardInput: {
    height: 50,
    width: "85%",
    paddingHorizontal: 20,
    borderColor: "black",
    // borderWidth: 1,
    borderRadius: 7,
  },
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 7,
  },
  copyButton: {
    flex: 1,
    width: "80%",
    height: "80%",
  },
  button: {
    backgroundColor: "red",
    height: 45,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
