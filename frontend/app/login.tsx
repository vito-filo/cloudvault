import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAuth } from "@/hooks/useAuth";
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
  const [username, setUsername] = useState("");
  const {
    isLoading,
    emailError,
    userNameError,
    initiateRegistration,
    loginWithPasskey,
  } = useAuth();

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
        {isLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : null}
        {(userNameError || username) && (
          <>
            <Text style={styles.errorTextInput}>
              * Username must be 3-20 characters and can only contain
              underscores (_)
            </Text>
            <TextInput
              style={[styles.emailInput, emailError && styles.errorBorder]}
              placeholder={username || "Username"}
              autoCapitalize="none"
              onChangeText={setUsername}
              editable={!isLoading}
            ></TextInput>
          </>
        )}
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
          onPress={() => loginWithPasskey(email)}
          disabled={isLoading}
        >
          <IconSymbol size={28} name="faceid" color={"black"} />
          <Text style={styles.buttonText}>Login with a passkey</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => initiateRegistration(email, username)}
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
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
    marginBottom: 10,
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
