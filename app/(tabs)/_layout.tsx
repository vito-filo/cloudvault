import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { ItemProvider } from "@/context/ItemContext";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
      </Tabs>
    </ItemProvider>
  );
}
