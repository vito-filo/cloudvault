import { useUserData } from "@/context/authContext";
import { useApi } from "@/hooks/useApi";
import { GroupInput } from "@/types/group";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function PasswordDetail() {
  const { groupIdParam, groupNameParam } = useLocalSearchParams<{
    groupIdParam: string;
    groupNameParam: string;
  }>();
  const { apiFetch } = useApi();
  const navigation = useNavigation();
  const [userData, token] = useUserData();
  const [groupName, setGroupName] = useState("");
  const [grouDescription, setGroupDescription] = useState<string | undefined>(
    ""
  );

  const fetchData = useCallback(async () => {
    if (!groupIdParam) return;

    try {
      const response = await apiFetch<GroupInput>(
        `/group?userId=${userData.id}&groupId=${groupIdParam}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGroupName(response.name);
      setGroupDescription(response.description);
    } catch (err) {
      console.error("Failed to fetch group data:", err);
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  }, [apiFetch, groupIdParam, token, userData.id]);

  useEffect(() => {
    if (!groupIdParam) {
      navigation.setOptions({
        title: "Create Group",
        headerBackTitle: "Back",
      });
    } else {
      navigation.setOptions({
        title: `Update ${groupNameParam} `,
        headerBackTitle: "Back",
      });
      fetchData();
    }
  }, [fetchData, groupIdParam, groupNameParam, navigation]);

  async function handlePress() {
    if (!groupName) {
      Alert.alert("Error", "Group name required.");
      return;
    }

    const inputData: GroupInput = {
      name: groupName,
      description: grouDescription,
    };

    const method = groupIdParam ? "PATCH" : "POST";
    const actionName = groupIdParam ? "updated" : "created";
    const endpoint = groupIdParam
      ? `/group/${userData.id}/${groupIdParam}`
      : `/group/${userData.id}`;

    try {
      const response = await apiFetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(inputData),
      });

      if (response) {
        Alert.alert("Success", `Group ${actionName} successfully.`);
        navigation.goBack();
      } else {
        Alert.alert("Error", `Group ${actionName} failed.`);
      }
    } catch (error) {
      console.error("Error", `Group ${actionName} failed.`, error);
      Alert.alert("Error", `Group ${actionName} failed.`);
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontWeight: "bold" }}>Group Name:</Text>
      {/* <Text style={{ marginBottom: 20 }}>{data.serviceName}</Text> */}
      <TextInput
        style={styles.input}
        placeholder="Enter group name"
        defaultValue={groupName}
        onChangeText={setGroupName}
      />

      <Text style={{ fontWeight: "bold" }}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter group description"
        defaultValue={grouDescription}
        onChangeText={setGroupDescription}
      />
      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>
          {groupIdParam ? "UPDATE" : "CREATE"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 7,
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
