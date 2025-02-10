import { RootStackParamList } from "@/app";
import { BaseText, TaskListTypeTabs } from "@/components";
import SingleTaskCard from "@/components/SingleTaskCard";
import { useAddTask } from "@/hooks/useAddTask";
import { useTasks } from "@/hooks/useTasks";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Colours } from "../../assets/colours";
import { Fonts } from "../../assets/fonts";

const TaskListScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const {
    tasks,
    isLoading: taskListLoading,
    error: taskListError,
    refetchTasks,
  } = useTasks();
  const {
    addTask,
    isLoading: addTaskLoading,
    error: addTaskError,
  } = useAddTask();
  const [taskListType, setTaskListType] = useState<"Scheduled" | "Anytime">(
    "Scheduled"
  );
  const [newTask, setNewTask] = useState("");

  const handleAddTask = async () => {
    await addTask(newTask, taskListType);
    setNewTask("");
    refetchTasks(); // Refresh task list after adding
  };

  const loading = taskListLoading || addTaskLoading;
  const error = taskListError || addTaskError;

  if (loading) {
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
      <BaseText style={styles.title}>All tasks</BaseText>
      <BaseText style={styles.subtitle}>Browse through list</BaseText>

      <TaskListTypeTabs
        onPress={() =>
          setTaskListType(
            taskListType === "Scheduled" ? "Anytime" : "Scheduled"
          )
        }
        taskListType={taskListType}
      />

      <FlatList
        data={tasks.filter((task) =>
          taskListType === "Scheduled"
            ? task.scheduleDate !== undefined
            : task.scheduleDate === undefined
        )}
        renderItem={({ item }) => (
          <SingleTaskCard
            task={item}
            onPress={() =>
              navigation.navigate("SingleTask", { taskId: item.id })
            }
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.taskList}
      />

      <View style={styles.newTaskContainer}>
        <TextInput
          style={styles.newTaskInput}
          placeholder="Add a new task"
          value={newTask}
          onChangeText={setNewTask}
        />
        <TouchableOpacity onPress={handleAddTask} disabled={loading}>
          <Feather
            name="plus-circle"
            size={24}
            color={Colours.highlight.primary}
          />
        </TouchableOpacity>
      </View>

      {addTaskError && <Text style={styles.errorText}>{addTaskError}</Text>}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Feather name="list" size={24} color={Colours.highlight.primary} />
          <Text style={styles.footerText}>Todo List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Feather name="settings" size={24} color={Colours.neutral.primary} />
          <Text style={styles.footerText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colours.neutral.white,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.inter.bold,
    color: Colours.neutral.dark1,
    marginTop: 24,
  },
  subtitle: {
    color: Colours.neutral.dark3,
    paddingVertical: 24,
  },
  taskList: {
    marginBottom: 20,
  },
  newTaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colours.neutral.light,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  newTaskInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: Colours.neutral.dark1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colours.neutral.light,
    paddingVertical: 10,
  },
  footerButton: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: Colours.neutral.dark3,
  },
  error: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    color: "red",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});

export default TaskListScreen;
