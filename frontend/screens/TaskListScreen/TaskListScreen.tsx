import { TaskCard } from "@/components/TaskCard";
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Task } from "../../../backend/src/models/types";
import { useTasks } from "../../hooks/useTasks";

const TaskListScreen = () => {
  const { tasks, isLoading, error, updateTask, createTask } = useTasks();

  const handleCreateTask = async () => {
    try {
      await createTask();
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };
  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      await updateTask(updatedTask);
    } catch (err) {
      console.error("Error in handleUpdateTask:", err);
    }
  };

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return (
      <View style={styles.error}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button title="Create New Task" onPress={handleCreateTask} />
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <TaskCard task={item} onUpdateTask={handleUpdateTask} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  error: {
    color: "red",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 24,
  },
  listContainer: {
    padding: 16,
  },
});

export default TaskListScreen;
