import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useSession } from "@/context/authContext";
import { apiFetch } from "@/utils/api";
import { useRouter } from "expo-router";
import { useState } from "react";

const logo = require("../assets/images/favicon.png");
const facebook = require("../assets/images/favicon.png");
const linkedin = require("../assets/images/favicon.png");
const tiktok = require("../assets/images/favicon.png");

export default function Login() {
  const { signIn } = useSession();
  const [click, setClick] = useState(false);
  const [email, setEmail] = useState("fertemupsa@gufum.com");
  const [password, setPassword] = useState("ExamplePassword123!");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const router = useRouter();

  async function handleLogin() {
    console.log("Login button pressed");
    if (email === undefined || email.trim() === "") {
      setEmailError(true);
      Alert.alert("Error", "Email can't be empty");
      return;
    } else {
      setEmailError(false);
    }

    if (password === undefined || password.trim() === "") {
      setPasswordError(true);
      Alert.alert("Error", "Password can't be empty");
      return;
    } else {
      setPasswordError(false);
    }

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      signIn(JSON.stringify(response));
      router.navigate("/(tabs)");
    } catch (error) {
      setEmailError(true);
      setPasswordError(true);
      alert("Login failed. Please check your credentials.");
      console.error("Failed to Login: ", error);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={loginStyle.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={loginStyle.scrollView}>
          <Image source={logo} style={loginStyle.image} resizeMode="contain" />
          <Text style={loginStyle.title}>Login</Text>
          <View style={loginStyle.inputView}>
            <TextInput
              style={[loginStyle.input, emailError && loginStyle.errorBorder]}
              placeholder="EMAIL OR USERNAME"
              value={email}
              onChangeText={setEmail}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <TextInput
              style={[
                loginStyle.input,
                passwordError && loginStyle.errorBorder,
              ]}
              placeholder="PASSWORD"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
          <View style={loginStyle.rememberView}>
            <View style={loginStyle.switch}>
              <Switch
                value={click}
                onValueChange={setClick}
                trackColor={{ true: "green", false: "gray" }}
              />
              <Text style={loginStyle.rememberText}>Remember Me</Text>
            </View>
            <View>
              <Pressable onPress={() => Alert.alert("Forget Password!")}>
                <Text style={loginStyle.forgetText}>Forgot Password?</Text>
              </Pressable>
            </View>
          </View>

          <View style={loginStyle.buttonView}>
            <Pressable style={loginStyle.button} onPress={() => handleLogin()}>
              <Text style={loginStyle.buttonText}>LOGIN</Text>
            </Pressable>
            <Text style={loginStyle.optionsText}>OR LOGIN WITH</Text>
          </View>

          <View style={loginStyle.mediaIcons}>
            <Image source={facebook} style={loginStyle.icons} />
            <Image source={tiktok} style={loginStyle.icons} />
            <Image source={linkedin} style={loginStyle.icons} />
          </View>

          <Text style={loginStyle.footerText}>
            {" "}
            Don&apos;t Have Account?
            <Text
              style={loginStyle.signup}
              onPress={() => router.navigate("/signup")}
            >
              {" "}
              Sign Up
            </Text>
          </Text>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const loginStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
  },
  image: {
    alignSelf: "center",
    height: 160,
    width: 170,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 40,
    color: "red",
  },
  inputView: {
    gap: 15,
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 5,
  },
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 7,
  },
  passwordInput: {
    height: "100%",
    width: "90%",
  },
  passwordContainer: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 7,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  rememberView: {
    width: "100%",
    paddingHorizontal: 50,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  switch: {
    flexDirection: "row",
    gap: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rememberText: {
    fontSize: 13,
  },
  forgetText: {
    fontSize: 11,
    color: "red",
  },
  button: {
    backgroundColor: "red",
    height: 45,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonView: {
    width: "100%",
    paddingHorizontal: 50,
  },
  optionsText: {
    textAlign: "center",
    paddingVertical: 10,
    color: "gray",
    fontSize: 13,
    marginBottom: 6,
  },
  mediaIcons: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 23,
  },
  icons: {
    width: 40,
    height: 40,
  },
  footerText: {
    textAlign: "center",
    color: "gray",
  },
  signup: {
    color: "red",
    fontSize: 13,
  },
  errorBorder: {
    borderColor: "red",
    borderWidth: 1,
  },
});
