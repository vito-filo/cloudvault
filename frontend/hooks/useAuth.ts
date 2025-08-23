import { useSession } from "@/context/authContext";
import {
  validateCode,
  validateEmail,
  validateUsername,
} from "@/utils/validate-strings";
import {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useApi } from "./useApi";

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
export function useAuth() {
  const { apiFetch } = useApi();
  const { signIn } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [userNameError, setUserNameError] = useState(false);
  const [verificationCodeError, setVerificationCodeError] = useState(false);

  const initiateRegistration = async (email: string, username: string) => {
    if (!validateEmail(email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    if (!validateUsername(username)) {
      setUserNameError(true);
      return;
    }
    setUserNameError(false);
    try {
      // generate email verification process
      await apiFetch("/auth/send-verification-code", {
        method: "POST",
        body: JSON.stringify({ username, email }),
      });
      router.push({ pathname: "/confirmEmail", params: { username, email } });
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message || "An error occurred during registration.");
      } else {
        alert("An error occurred during registration.");
      }
    }
  };
  const verifyCode = async (username: string, email: string, code: string) => {
    if (!validateCode(code)) {
      setVerificationCodeError(true);
      return;
    }
    setVerificationCodeError(false);
    setIsLoading(true);
    try {
      await apiFetch("/auth/verify-code", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      registerPasskey(username, email);
    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationCodeError(true);
    }
  };

  const loginWithPasskey = async (email: string) => {
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

  const registerPasskey = async (username: string, email: string) => {
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
      // Ask the authenticator to register a new credential
      const regRequest = await startRegistration({ optionsJSON: regOptions });

      // Send the registration response to the server for verification
      const regResponse: { verified: boolean } = await apiFetch(
        "/auth/webauthn/verify-registration-response",
        {
          method: "POST",
          body: JSON.stringify({
            email: email,
            username: username,
            response: regRequest,
          }),
        }
      );
      if (regResponse.verified) {
        // Automatic login after registration
        loginWithPasskey(email);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    emailError,
    userNameError,
    verificationCodeError,
    initiateRegistration,
    loginWithPasskey,
    registerPasskey,
    verifyCode,
  };
}
