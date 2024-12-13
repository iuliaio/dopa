import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Task } from "../../backend/src/models/types";

const API_URL = "https://dopa-443105.nw.r.appspot.com";

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tasks`);
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskCard}>
      <Text style={styles.taskName}>{item.name}</Text>
      <Text style={styles.taskDescription}>{item.description}</Text>
      <Text style={styles.taskStatus}>Status: {item.status}</Text>

      {/* Display subtasks if they exist */}
      {item.subtasks && item.subtasks.length > 0 && (
        <View style={styles.subtasksContainer}>
          <Text style={styles.subtaskHeader}>Subtasks:</Text>
          {item.subtasks.map((subtask, index) => (
            <View key={index} style={styles.subtask}>
              <Text>
                {subtask.name} - {subtask.status}
              </Text>
              <Text>Duration: {subtask.duration}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={tasks}
      renderItem={renderTask}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
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
    paddingLeft: 8,
    marginBottom: 4,
  },
});

export default TaskList;
