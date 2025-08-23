import { useUserData } from "@/context/authContext";
import { useItemContext } from "@/context/ItemContext";
import { useApi } from "@/hooks/useApi";
import { formStyle } from "@/styles/createForm";
import { GroupDetails, GroupInput } from "@/types/group";
import AntDesign from "@expo/vector-icons/AntDesign";
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
import { MultiSelect } from "react-native-element-dropdown";

type UserData = {
  email: string;
  name?: string;
  searchIndex?: string; // conposed of name - email for searching
};

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
  const [searchData, setSearchData] = useState<UserData[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { setGroupListRefresh } = useItemContext();

  async function handleSearch(searchParam: string) {
    try {
      const response = await apiFetch<UserData[]>(
        `/group/user/search?name=${searchParam}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      response.forEach((user) => {
        user.searchIndex = `${user.name} - ${user.email}`;
      });
      setSearchData(response);
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Failed to fetch user data. Please try again later.");
    }
  }

  const fetchData = useCallback(async () => {
    if (!groupIdParam) return;

    try {
      const response = await apiFetch<GroupDetails>(
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

      // set group members
      const members = response.members.map((member) => member.user.email);
      setSelectedUsers(members);

      // Due to Multimodal internal behavior, we need to set searchData
      const memberData = response.members.map((member) => ({
        email: member.user.email,
        name: member.user.name,
        searchIndex: `${member.user.name} - ${member.user.email}`,
      }));
      setSearchData(memberData);
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

  async function handleCreate() {
    if (!groupName) {
      Alert.alert("Error", "Group name required.");
      return;
    }

    const inputData: GroupInput = {
      name: groupName,
      description: grouDescription,
      membersEmail: selectedUsers,
    };

    const method = groupIdParam ? "PATCH" : "POST";
    const actionName = groupIdParam ? "update" : "create";
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
        setGroupListRefresh(true);
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
      <TextInput
        style={formStyle.input}
        placeholder="Enter group name"
        defaultValue={groupName}
        onChangeText={setGroupName}
      />

      <Text style={{ fontWeight: "bold" }}>Description</Text>
      <TextInput
        style={formStyle.input}
        placeholder="Enter group description"
        defaultValue={grouDescription}
        onChangeText={setGroupDescription}
      />

      <Text style={{ fontWeight: "bold" }}>Group Members</Text>
      <MultiSelect
        style={formStyle.input}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        search
        data={searchData}
        labelField="searchIndex"
        valueField="email"
        placeholder={"Select group members"}
        searchPlaceholder="Search..."
        value={selectedUsers}
        onChange={(item) => {
          setSelectedUsers(item);
        }}
        onChangeText={handleSearch}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color="black"
            name="Safety"
            size={20}
          />
        )}
        selectedStyle={styles.selectedStyle}
      />

      <Pressable style={formStyle.button} onPress={handleCreate}>
        <Text style={formStyle.buttonText}>
          {groupIdParam ? "UPDATE" : "CREATE"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 15 },
  dropdown: {
    height: 50,
    paddingHorizontal: 8,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 7,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
  selectedStyle: {
    borderRadius: 12,
  },
});
