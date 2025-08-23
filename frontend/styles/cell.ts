import { StyleSheet } from "react-native";

export const cellStyle = StyleSheet.create({
  name: {
    marginRight: 10,
    // fontSize: 16, // Increase the font size to 16
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginVertical: 5,
    paddingHorizontal: 50,
    borderRadius: 5,
    elevation: 2, // Adds a shadow for Android
    shadowColor: "#000", // Adds a shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
});
