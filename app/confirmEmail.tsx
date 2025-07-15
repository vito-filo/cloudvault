import { useAuth } from "@/hooks/useAuth";
import { useLocalSearchParams } from "expo-router";
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

export default function ConfirmEmail() {
  const { username, email } = useLocalSearchParams<{
    username: string;
    email: string;
  }>();
  const { verificationCodeError, verifyCode } = useAuth();
  const [verificationCode, setVerificationCode] = useState("");

  return (
    <ImageBackground
      source={clouds}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { marginTop: 20 }]}>Confirm Email</Text>
        <Text style={styles.subtitle}>
          We have sent a verification code to:
        </Text>
        <Text style={styles.subtitle}> {email} </Text>
        {verificationCodeError && (
          <Text style={styles.errorTextInput}>
            * Verification code is incorrect
          </Text>
        )}
        <TextInput
          style={[styles.emailInput, email ? {} : styles.errorBorder]}
          onChangeText={setVerificationCode}
          placeholder="Enter verification code"
          keyboardType="numeric"
        />
        <Pressable
          style={styles.button}
          onPress={() => verifyCode(username, email, verificationCode)}
        >
          <Text style={styles.buttonText}>Confirm</Text>
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
    height: "45%",
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
