import { RootStackParamList } from "@/app";
import { SubtaskList } from "@/components";
import { useTask } from "@/hooks/useTask";
import { RouteProp, useRoute } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colours } from "../../assets/colours";
import { Fonts } from "../../assets/fonts";

type SingleTaskScreenProps = {
  route: RouteProp<RootStackParamList, "SingleTask">;
};

const SingleTaskScreen = () => {
  const route = useRoute<SingleTaskScreenProps["route"]>();
  const taskId = route.params?.taskId;

  const { task, isLoading, error } = useTask(taskId);

  if (!taskId) return <Text>Error: Task ID is missing</Text>;
  if (error) return <Text>{error}</Text>;
  if (!task || isLoading) return <Text>Loading...</Text>;

  const calculateProgress = () => {
    const completedSubtasks = task.subtasks.filter(
      (subtask) => subtask.status === "COMPLETED"
    ).length;
    return (completedSubtasks / task.subtasks.length) * 100 || 0;
  };

  return (
    <View style={styles.container}>
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
      <SubtaskList task={task} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.highlight.quaternary,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  detailsContainer: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colours.neutral.light,
  },
  taskTitle: {
    fontSize: 28,
    fontFamily: Fonts.inter.bold,
    color: Colours.neutral.dark1,
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colours.highlight.tertiary,
    borderRadius: 3,
    marginVertical: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colours.highlight.primary,
    borderRadius: 3,
  },
  taskDescription: {
    fontSize: 15,
    fontFamily: Fonts.inter.regular,
    color: Colours.neutral.dark3,
    marginBottom: 15,
  },
});

export default SingleTaskScreen;
