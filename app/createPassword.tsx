import { useUserData } from "@/context/authContext";
import { useApi } from "@/hooks/useApi";
import { formStyle } from "@/styles/createForm";
import { PasswordInput } from "@/types/password";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useReducer, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

function reducer(state: PasswordInput, action: { key: string; value: string }) {
  return {
    ...state,
    [action.key]: action.value,
  };
}

export default function CreatePassword() {
  const { apiFetch } = useApi();
  const [userData, token] = useUserData();
  const navigation = useNavigation();
  const router = useRouter();
  const [isServiceNameValid, setIsServiceNameValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [data, setData] = useReducer(reducer, {
    serviceName: "",
    password: "",
  });

  useEffect(() => {
    navigation.setOptions({
      title: "Create Password",
      headerBackTitle: "Back",
    });
    setIsPasswordValid(true);
    setIsServiceNameValid(true);
  }, [navigation]);

  const validateInput = () => {
    const missingFields: string[] = [];
    if (!data.serviceName) {
      setIsServiceNameValid(false);
      missingFields.push("Service Name");
    }
    if (!data.password) {
      setIsPasswordValid(false);
      missingFields.push("Password");
    }

    if (missingFields.length > 0) {
      alert(`Thiese fields are mandatory:\n ${missingFields.join(", \n")}`);
      return false;
    }
    setIsPasswordValid(true);
    setIsServiceNameValid(true);
    return true;
  };

  const handlePress = async () => {
    if (!validateInput()) {
      return; // Stop submission if validation fails
    }

    try {
      await apiFetch(`/password/${userData.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      router.back();
    } catch (error) {
      console.error("Error submitting password:", error);
      alert("Failed to submit password. Please try again.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontWeight: "bold" }}>Service Name:</Text>
      {/* <Text style={{ marginBottom: 20 }}>{data.serviceName}</Text> */}
      <TextInput
        style={isServiceNameValid ? formStyle.input : formStyle.invalidInput}
        placeholder="Enter service name"
        onChangeText={(text) => setData({ key: "serviceName", value: text })}
      />

      <Text style={{ fontWeight: "bold" }}>Password:</Text>
      <TextInput
        style={isPasswordValid ? formStyle.input : formStyle.invalidInput}
        placeholder="Enter password"
        onChangeText={(text) => setData({ key: "password", value: text })}
      />

      <Text style={{ fontWeight: "bold" }}>Username:</Text>
      <TextInput
        style={formStyle.input}
        placeholder="Enter username"
        onChangeText={(text) => setData({ key: "username", value: text })}
      />

      <Text style={{ fontWeight: "bold" }}>Email:</Text>
      <TextInput
        style={formStyle.input}
        placeholder="Enter email"
        onChangeText={(text) => setData({ key: "email", value: text })}
      />

      <Text style={{ fontWeight: "bold" }}>URL:</Text>
      <TextInput
        style={formStyle.input}
        placeholder="Enter URL"
        onChangeText={(text) => setData({ key: "url", value: text })}
      />

      <Text style={{ fontWeight: "bold" }}>Description:</Text>
      <TextInput
        style={formStyle.input}
        placeholder="Enter description"
        onChangeText={(text) => setData({ key: "description", value: text })}
      />
      <Pressable style={formStyle.button} onPress={handlePress}>
        <Text style={formStyle.buttonText}>CREATE</Text>
      </Pressable>
    </View>
  );
}
