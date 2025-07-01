import { IconSymbol } from "@/components/ui/IconSymbol";
import { useSession } from "@/context/authContext";
import { useApi } from "@/hooks/useApi";
import {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
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
import { validateEmail } from "../utils/validate-email";

const logo = require("../assets/images/icon.png");
const clouds = require("../assets/images/clouds.jpg");

type AuthResponse = {
  accessToken: string;
  user: {
    id: number;
    email: string;
  };
  verified: boolean;
  authenticationInfo: {
    credentialID: string;
    newCounter: number;
    userVerified: boolean;
    credentialDeviceType: "singleDevice" | "multiDevice";
    credentialBackedUp: boolean;
    origin: string;
    rpID: string;
    authenticatorExtensionResults?: unknown;
  };
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { apiFetch } = useApi();
  const { signIn } = useSession();
  const router = useRouter();

  const handleRegister = async () => {
    if (!validateEmail(email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setIsLoading(true);
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
      const regResponse: { verified: boolean } = await apiFetch(
        "/auth/webauthn/verify-registration-response",
        {
          method: "POST",
          body: JSON.stringify({
            email: email,
            response: regRequest,
          }),
        }
      );
      if (regResponse.verified) {
        // Automatic login after registration
        handleLogin();
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setIsLoading(true);
    try {
      const authOptions: PublicKeyCredentialRequestOptionsJSON = await apiFetch(
        `/auth/webauthn/generate-authentication-options?email=${email}`,
        { method: "GET" }
      );

      console.log("auth options:", authOptions);
      const authRequest = await startAuthentication({
        optionsJSON: authOptions,
      });

      console.log("auth request:", authRequest);
      const authResponse: AuthResponse = await apiFetch(
        "/auth/webauthn/verify-authentication-response",
        {
          method: "POST",
          body: JSON.stringify({ email: email, response: authRequest }),
        }
      );
      signIn(
        JSON.stringify({
          accessToken: authResponse.accessToken,
          user: authResponse.user,
        })
      );
      router.navigate("/(tabs)");
    } catch (error) {
      console.error("Authentication failed:", error);
      alert("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
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
          <Text style={styles.errorTextInput}>* Email is mandatory</Text>
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
          onPress={handleLogin}
          disabled={isLoading}
        >
          <IconSymbol size={28} name="faceid" color={"black"} />
          <Text style={styles.buttonText}>Login with a passkey</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={handleRegister}
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
