import { RootStackParamList } from "@/app";
import { BaseText, SubtaskList } from "@/components";
import { TimerHandle } from "@/components/Timer";
import { useDeleteTask } from "@/hooks/useDeleteTask";
import { useTask } from "@/hooks/useTask";
import { useTasks } from "@/hooks/useTasks";
import { formatScheduleDate } from "@/utils/dateUtils";
import { secondsToTime } from "@/utils/timeUtils";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Subtask } from "../../../backend/src/models/types";
import { Colours } from "../../assets/colours";
import { Fonts } from "../../assets/fonts";

type SingleTaskScreenProps = {
  route: RouteProp<RootStackParamList, "SingleTask">;
};

const SingleTaskScreen = () => {
  const route = useRoute<SingleTaskScreenProps["route"]>();
  const navigation = useNavigation();
  const taskId = route.params?.taskId;

  const { deleteTask } = useDeleteTask();
  const { refetchTasks } = useTasks();

  const { task, refetchTask } = useTask(taskId);

  const [activeSubtaskId, setActiveSubtaskId] = useState<string | null>(null);
  const [activeSubtaskTime, setActiveSubtaskTime] = useState<number>(0);
  const activeTimerRef = useRef<TimerHandle | null>(null);

  useEffect(() => {
    // Set the header title to the task name
    if (task?.name) {
      navigation.setOptions({
        headerTitle: task.name,
        headerRight: () => (
          <TouchableOpacity onPress={handleDeleteTask}>
            <Feather name="trash" size={24} color={Colours.neutral.secondary} />
          </TouchableOpacity>
        ),
      });
    }
  }, [task?.name, navigation]);

  useEffect(() => {
    // Refresh task data when activeSubtaskId changes
    if (activeSubtaskId) {
      refetchTask();
    }
  }, [activeSubtaskId]);

  if (!taskId || !task)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Feather
          name="alert-circle"
          size={24}
          color={Colours.support.error.primary}
        />
        <Text>Error: task not found</Text>
      </View>
    );

  const handleDeleteTask = async () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this whole task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteTask(taskId);
            navigation.navigate("TaskList" as never);
            await refetchTasks();
          },
        },
      ]
    );
  };

  const activeSubtask = task.subtasks.find((s) => s.id === activeSubtaskId);

  const calculateProgress = () => {
    const total = task.subtasks.length || 1;
    const completed = task.subtasks.filter(
      (s) => s.status === "COMPLETED"
    ).length;
    return (completed / total) * 100;
  };

  const handleSubtaskActiveChange = (
    subtask: Subtask,
    isActive: boolean,
    timeLeft: number
  ) => {
    setActiveSubtaskId(isActive ? subtask.id : null);
    setActiveSubtaskTime(timeLeft);
    if (!isActive) {
      refetchTask(); // Refresh task data when a subtask becomes inactive
    }
  };

  const formatDuration = (seconds: number) => {
    const { hours, minutes, seconds: secs } = secondsToTime(seconds);
    return hours > 0
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(
          2,
          "0"
        )}`
      : `${minutes}:${String(secs).padStart(2, "0")}`;
  };

  const handleTimerRef = (subtaskId: string, ref: TimerHandle | null) => {
    if (subtaskId === activeSubtaskId) {
      activeTimerRef.current = ref;
    }
  };

  const handleCompleteSubtask = async () => {
    if (activeTimerRef.current) {
      activeTimerRef.current.complete();
      refetchTask();
    }
  };

  const handleAddFiveMin = () => {
    if (activeTimerRef.current) {
      activeTimerRef.current.addFiveMinutes();
      refetchTask();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BaseText style={styles.description}>{task.description}</BaseText>

        {activeSubtask && (
          <View style={styles.subtaskFocus}>
            <View>
              <Text style={styles.focusSubtask}>{activeSubtask.name}</Text>
              <Text style={styles.focusDuration}>
                {formatDuration(activeSubtaskTime)}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.completeSubtaskButton}
                onPress={handleCompleteSubtask}
              >
                <Text style={styles.completeSubtaskText}>Complete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addFiveMinButton}
                onPress={handleAddFiveMin}
              >
                <Text style={styles.addFiveMinText}>+ 5 min</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.meta}>
        {task.scheduleDate && (
          <View style={styles.dateRow}>
            <Feather name="calendar" size={16} color={Colours.neutral.dark3} />
            <BaseText style={styles.dateText}>
              {formatScheduleDate(task.scheduleDate)}
            </BaseText>
          </View>
        )}
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${calculateProgress()}%` }]}
          />
        </View>
        <SubtaskList
          task={task}
          onSubtaskActiveChange={handleSubtaskActiveChange}
          onTimerRef={handleTimerRef}
          onTaskUpdate={() => refetchTask()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flex: 2,
    backgroundColor: Colours.neutral.lightest,
    padding: 16,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: Fonts.inter.semiBold,
    color: Colours.neutral.dark1,
  },
  description: {
    color: Colours.neutral.dark3,
    marginBottom: 16,
  },
  subtaskFocus: {
    flex: 1,
    borderRadius: 16,
    justifyContent: "space-between",
  },
  focusSubtask: {
    fontSize: 28,
    fontFamily: Fonts.inter.bold,
    color: Colours.neutral.dark1,
  },
  focusDuration: {
    fontSize: 16,
    color: Colours.neutral.dark3,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: "auto",
  },
  completeSubtaskButton: {
    flex: 1,
    backgroundColor: Colours.neutral.primary,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  completeSubtaskText: {
    color: "white",
    fontFamily: Fonts.inter.semiBold,
  },
  addFiveMinButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colours.neutral.primary,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  addFiveMinText: {
    color: Colours.neutral.primary,
    fontFamily: Fonts.inter.semiBold,
  },
  meta: {
    flex: 3,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  dateText: {
    color: Colours.neutral.dark3,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colours.neutral.secondary,
    borderRadius: 10,
    overflow: "hidden",
    margin: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colours.highlight.primary,
  },
});

export default SingleTaskScreen;
