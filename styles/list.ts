import { StatusBar, StyleSheet } from "react-native";

export const listStyle = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
  addButton: {
    position: "absolute",
    bottom: 80,
    right: 30,
    width: 55,
    height: 55,
    backgroundColor: "#FF3F33",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
