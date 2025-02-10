import { RootStackParamList } from "@/app";
import { useTask } from "@/hooks/useTask";
import { useUpdateTask } from "@/hooks/useUpdateTask";
import { RouteProp, useRoute } from "@react-navigation/native";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Subtask } from "../../../backend/src/models/types";
import { Colours } from "../../assets/colours";
import { Fonts } from "../../assets/fonts";

type SingleTaskScreenProps = {
  route: RouteProp<RootStackParamList, "SingleTask">;
};

const SingleTaskScreen = () => {
  const route = useRoute<SingleTaskScreenProps["route"]>();
  const taskId = route.params?.taskId;

  const { task, isLoading, error, refetchTask } = useTask(taskId);
  const {
    addSubtask,
    updateSubtask,
    deleteSubtask,
    isLoading: updateLoading,
    error: updateError,
  } = useUpdateTask();

  if (!taskId) return <Text>Error: Task ID is missing</Text>;
  if (error || updateError) return <Text>{error || updateError}</Text>;
  if (!task || isLoading) return <Text>Loading...</Text>;

  const calculateProgress = () => {
    const completedSubtasks = task.subtasks.filter(
      (subtask) => subtask.status === "COMPLETED"
    ).length;
    return (completedSubtasks / task.subtasks.length) * 100 || 0;
  };

  const handleCompleteSubtask = async (subtask: Subtask) => {
    const result = await updateSubtask(task, {
      ...subtask,
      status: subtask.status === "COMPLETED" ? "PENDING" : "COMPLETED",
    });
    if (result) refetchTask(); // Only refetch if update was successful
  };

  const handleAddSubtask = async () => {
    const result = await addSubtask(task, {
      name: "New Subtask",
      status: "PENDING",
      duration: "2",
    });
    if (result) refetchTask();
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    const result = await deleteSubtask(task, subtaskId);
    if (result) refetchTask();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{task.name}</Text>
      </View>

      {/* Task Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.taskTitle}>{task.name}</Text>
        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBar, { width: `${calculateProgress()}%` }]}
          />
        </View>
        <Text style={styles.taskDescription}>
          {task.description || "No description"}
        </Text>
      </View>

      {/* Subtasks */}
      <FlatList
        data={task.subtasks}
        renderItem={({ item }) => (
          <View style={styles.subtaskContainer}>
            <TouchableOpacity
              onPress={() => handleCompleteSubtask(item)}
              style={[
                styles.subtaskStatus,
                item.status === "COMPLETED"
                  ? styles.completedSubtask
                  : styles.pendingSubtask,
              ]}
            >
              <Feather
                name={item.status === "COMPLETED" ? "check" : "circle"}
                size={20}
                color={
                  item.status === "COMPLETED"
                    ? Colours.support.success.primary
                    : Colours.neutral.primary
                }
              />
            </TouchableOpacity>
            <View style={styles.subtaskContent}>
              <Text style={styles.subtaskName}>{item.name}</Text>
              <Text style={styles.subtaskDuration}>{item.duration}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteSubtask(item.id)}>
              <Feather
                name="trash"
                size={20}
                color={Colours.highlight.primary}
              />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addSubtaskContainer}
            onPress={handleAddSubtask}
          >
            <Feather
              name="plus-circle"
              size={20}
              color={Colours.highlight.primary}
            />
            <Text style={styles.addSubtaskText}>Add new subtask</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colours.neutral.lightest,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.inter.semiBold,
    color: Colours.neutral.dark1,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  taskTitle: {
    fontSize: 24,
    fontFamily: Fonts.inter.bold,
    marginBottom: 5,
    color: Colours.neutral.dark1,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: Colours.neutral.light,
    borderRadius: 5,
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colours.highlight.primary,
    borderRadius: 5,
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: Fonts.inter.regular,
    color: Colours.neutral.dark3,
  },
  subtaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colours.neutral.light,
  },
  subtaskStatus: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  completedSubtask: {
    backgroundColor: Colours.support.success.light,
  },
  pendingSubtask: {
    backgroundColor: Colours.neutral.lightest,
  },
  subtaskContent: {
    flex: 1,
  },
  subtaskName: {
    fontSize: 16,
    fontFamily: Fonts.inter.bold,
    color: Colours.neutral.dark1,
  },
  subtaskDuration: {
    fontSize: 14,
    fontFamily: Fonts.inter.regular,
    color: Colours.neutral.dark3,
  },
  addSubtaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  addSubtaskText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: Fonts.inter.semiBold,
    color: Colours.highlight.primary,
  },
});

export default SingleTaskScreen;
