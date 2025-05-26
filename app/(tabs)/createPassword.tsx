import { InputPassword } from "@/types/password";
import { apiFetch } from "@/utils/api";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreatePasswordPage() {
  const router = useRouter();
  const [serviceName, setServiceName] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isServiceNameValid, setIsServiceNameValid] = useState(true);

  useEffect(() => {
    // Reset validation states when the component mounts
    setIsPasswordValid(true);
    setIsServiceNameValid(true);
  }, []);

  const validateInput = () => {
    const missingFields: string[] = [];
    if (!serviceName) {
      setIsServiceNameValid(false);
      missingFields.push("Service Name");
    }
    if (!password) {
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

  const handleSubmit = async () => {
    if (!validateInput()) {
      return; // Stop submission if validation fails
    }
    const userId = 1; // TODO Replace with actual user ID logic
    const inputData: InputPassword = {
      serviceName: serviceName,
      password: password,
      username: userName,
      email: email,
      url: url,
      description: description,
    };

    try {
      await apiFetch(`/password/${userId}`, {
        method: "POST",
        body: JSON.stringify(inputData),
      });

      router.push("/(tabs)");
    } catch (error) {
      console.error("Error submitting password:", error);
      alert("Failed to submit password. Please try again.");
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <TextInput
        autoCapitalize="none"
        placeholder="Name"
        style={
          isServiceNameValid
            ? InputFormStyle.input
            : InputFormStyle.invalidInput
        }
        onChangeText={setServiceName}
        value={serviceName}
      />
      <TextInput
        autoCapitalize="none"
        placeholder="Password"
        style={
          isPasswordValid ? InputFormStyle.input : InputFormStyle.invalidInput
        }
        onChangeText={setPassword}
        value={password}
      />
      <TextInput
        autoCapitalize="none"
        placeholder="User Name"
        style={InputFormStyle.input}
        onChangeText={setUserName}
        value={userName}
      />
      <TextInput
        autoCapitalize="none"
        placeholder="E-Mail"
        style={InputFormStyle.input}
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        autoCapitalize="none"
        placeholder="URL"
        style={InputFormStyle.input}
        onChangeText={setUrl}
        value={url}
      />
      <TextInput
        autoCapitalize="none"
        placeholder="Description"
        style={InputFormStyle.input}
        onChangeText={setDescription}
        value={description}
      />
      <Button title="Submit" onPress={handleSubmit} />
    </SafeAreaView>
  );
}

const InputFormStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "pink",
  },
  input: {
    margin: 10,
    marginBottom: 20,
    width: "90%",
    borderColor: "gray",
    borderWidth: 1,
    marginHorizontal: 20,
  },
  invalidInput: {
    margin: 10,
    marginBottom: 20,
    width: "90%",
    borderColor: "red",
    borderWidth: 1,
    marginHorizontal: 20,
  },
  label: {
    margin: 10,
  },
});
