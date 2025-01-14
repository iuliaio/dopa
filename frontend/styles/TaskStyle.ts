import { StyleSheet } from "react-native";

export const taskStyles = StyleSheet.create({
  taskCard: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  taskStatus: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
  },
  subtasksContainer: {
    marginTop: 8,
  },
  subtaskHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtask: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  editContainer: {
    gap: 8,
  },
  displayContainer: {
    gap: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  nameText: {
    fontSize: 16,
    color: "#0066cc",
    textDecorationLine: "underline",
  },
});
