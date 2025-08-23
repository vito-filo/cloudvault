import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { SessionProvider } from "@/context/authContext";
import { ItemProvider } from "@/context/ItemContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Platform, StyleSheet, View } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const _renderStack = () => {
    return (
      <>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </>
    );
  };

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SessionProvider>
        <ItemProvider>
          {Platform.OS === "web" ? (
            <View style={styles.container}>
              <View style={styles.phoneContainer}>{_renderStack()}</View>
            </View>
          ) : (
            _renderStack()
          )}
        </ItemProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    backgroundColor: "#eee", // for contrast
  },
  phoneContainer: {
    width: "100%",
    maxWidth: 390, // simulate mobile width like iPhone 14
    aspectRatio: 9 / 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
    backgroundColor: "#fff",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  },
});
