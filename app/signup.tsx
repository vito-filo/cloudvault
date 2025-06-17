import { useApi } from "@/hooks/useApi";
import {
  PublicKeyCredentialCreationOptionsJSON,
  startRegistration,
} from "@simplewebauthn/browser";
import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const clouds = require("../assets/images/clouds.jpg");

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const { apiFetch } = useApi();

  const handleRegister = async () => {
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      setEmailError(true);
      return;
    }
    setEmailError(false);

    try {
      // Get Registration Options from the server
      const regOptions: PublicKeyCredentialCreationOptionsJSON = await apiFetch(
        `/auth/webauthn/generate-registration-options?email=${email}`,
        { method: "Get" }
      );
      console.log("Registration options:", regOptions);

      // Ask the authenticator to register a new credential
      const regRequest = await startRegistration({ optionsJSON: regOptions });

      // Send the registration response to the server for verification
      const regResponse = await apiFetch(
        "/auth/webauthn/verify-registration-response",
        {
          method: "POST",
          body: JSON.stringify({
            email: email,
            response: regRequest,
          }),
        }
      );
      console.log("Registration response:", regResponse);
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <ImageBackground
      source={clouds}
      resizeMode="cover"
      style={styles.container}
    >
      <View style={styles.singUpContainer}>
        <Text style={styles.title}>Register with Passkey</Text>
        <Text style={styles.text}>
          No password needed, register with yout biometric authenticator
        </Text>

        <TextInput
          placeholder="Email"
          style={[styles.emailInput, emailError && styles.errorBorder]}
          autoCapitalize="none"
          onChangeText={setEmail}
        ></TextInput>

        <Pressable style={styles.button} onPress={handleRegister}>
          <Text>Register</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  singUpContainer: {
    width: "90%",
    height: "50%",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  emailInput: {
    width: "90%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 40,
    marginBottom: 20,
  },
  errorBorder: {
    borderColor: "red",
    borderWidth: 1,
  },
  button: {
    width: "90%",
    height: 50,
    backgroundColor: "#007bff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
