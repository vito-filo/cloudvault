import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useSession } from "@/context/authContext";
import { ItemProvider } from "@/context/ItemContext";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session } = useSession();

  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }

  return (
    <ItemProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: "absolute",
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "paswords",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="lock.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="createPassword"
          options={{
            title: "New Password",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="plus.rectangle.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="groupsList"
          options={{
            title: "Groups",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.3.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </ItemProvider>
  );
}
