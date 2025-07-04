import { IconSymbol } from "@/components/ui/IconSymbol";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const logo = require("../assets/images/icon.png");
const clouds = require("../assets/images/clouds.jpg");

export default function Login() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { apiFetch } = useApi();
  const { isLoading, emailError, loginWithPasskey } = useAuth();

  const initiateRegistration = async () => {
    try {
      // generate email verification process
      await apiFetch("/auth/send-verification-code", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      router.push({ pathname: "/confirmEmail", params: { email } });
    } catch (error) {
      // TODO show error to user
      alert("Failed to initiate registration. Please try again.");
    }
  };

  return (
    <ImageBackground
      source={clouds}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.container}>
        {" "}
        <Image source={logo} style={styles.image} />
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Enter your email</Text>
        {/* Loading when the request is in progress */}
        {isLoading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
        {emailError && (
          <Text style={styles.errorTextInput}>
            * Please insert a valid email
          </Text>
        )}
        <TextInput
          style={[styles.emailInput, emailError && styles.errorBorder]}
          placeholder="Email"
          autoCapitalize="none"
          onChangeText={setEmail}
          editable={!isLoading}
        ></TextInput>
        <Pressable
          style={styles.button}
          // onPress={handleLogin}
          onPress={() => loginWithPasskey(email)}
          disabled={isLoading}
        >
          <IconSymbol size={28} name="faceid" color={"black"} />
          <Text style={styles.buttonText}>Login with a passkey</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          // onPress={handleRegister}
          onPress={initiateRegistration}
          disabled={isLoading}
        >
          <IconSymbol size={28} name="person.badge.key" color={"black"} />
          <Text style={styles.buttonText}>Register</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  container: {
    width: "90%",
    height: "75%",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  emailInput: {
    width: "80%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  errorBorder: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorTextInput: {
    color: "red",
    fontSize: 10,
    marginBottom: 3,
    width: "80%",
  },
  button: {
    width: "80%",
    height: 50,
    marginBottom: 10,
    backgroundColor: "rgba(65, 180, 255, 0.8)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  buttonText: {
    width: "60%",
    marginLeft: 10,
    textAlign: "center",
  },
});
