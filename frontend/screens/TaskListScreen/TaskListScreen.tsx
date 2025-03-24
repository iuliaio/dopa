import { RootStackParamList } from "@/app";
import {
  NewTaskModal,
  ScheduledTasksCalendar,
  TaskListTypeTabs,
} from "@/components";
import SingleTaskCard from "@/components/SingleTaskCard";
import { useAddTask } from "@/hooks/useAddTask";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useTasks } from "@/hooks/useTasks";
import { normalizeDate } from "@/utils/dateUtils";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Task } from "../../../backend/src/models/types";
import { Colours } from "../../assets/colours";
import { Fonts } from "../../assets/fonts";

type TaskList = "Scheduled" | "Anytime";

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

  const { calendarAccessToken, signInWithGoogle, loadSavedToken } =
    useGoogleAuth();

  const [taskListType, setTaskListType] = useState<TaskList>("Scheduled");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  );
  const [newTask, setNewTask] = useState<Task>({
    id: "",
    name: "",
    scheduleDate: selectedDate ?? undefined,
    subtasks: [{ id: "", name: "", status: "PENDING", duration: "" }],
    description: "",
    status: "PENDING",
  });
  const [showGoogleAuthPrompt, setShowGoogleAuthPrompt] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    if (taskListType !== "Scheduled") {
      return task.scheduleDate === undefined;
    }

    if (!selectedDate) {
      return task.scheduleDate !== undefined;
    }

    const taskDate = normalizeDate(task.scheduleDate);
    return taskDate === selectedDate;
  });

  const handleAddTask = async (
    taskName: string,
    subtaskName: string,
    time?: string
  ) => {
    if (!taskName.trim()) return;

    if (selectedDate && !calendarAccessToken) {
      setNewTask({
        ...newTask,
        name: taskName,
        scheduleDate: selectedDate,
        scheduleTime: time,
        subtasks: [
          { id: "", name: subtaskName, status: "PENDING", duration: "" },
        ],
      });
      return;
    }

    try {
      await addTask(taskName, selectedDate, time, subtaskName);
      setNewTask({
        id: "",
        name: "",
        scheduleDate: selectedDate ?? undefined,
        subtasks: [{ id: "", name: "", status: "PENDING", duration: "" }],
        description: "",
        status: "PENDING",
      });
      setModalVisible(false);
      await refetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TaskListTypeTabs
        onPress={() =>
          setTaskListType(
            taskListType === "Scheduled" ? "Anytime" : "Scheduled"
          )
        }
        taskListType={taskListType}
      />

      {taskListType === "Scheduled" && (
        <View style={styles.calendarContainer}>
          <ScheduledTasksCalendar
            selectedDate={selectedDate}
            setSelectedDate={(date) => {
              setSelectedDate(date);
              setModalVisible(true);
              setNewTask((prev) => ({
                ...prev,
                scheduleDate: date,
              }));
            }}
          />
        </View>
      )}

      <FlatList
        data={filteredTasks}
        renderItem={({ item }) => {
          if (taskListLoading) {
            return <ActivityIndicator />;
          }
          if (taskListError) {
            return <Text style={styles.errorText}>{taskListError}</Text>;
          }
          return (
            <SingleTaskCard
              task={item}
              onPress={() =>
                navigation.navigate("SingleTask", { taskId: item.id })
              }
            />
          );
        }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.taskList}
      />
      {addTaskLoading && <Text style={styles.loadingText}>Adding task...</Text>}
      {addTaskError && <Text style={styles.errorText}>{addTaskError}</Text>}

      <NewTaskModal selectedDate={selectedDate} onAddTask={handleAddTask} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colours.neutral.white,
  },
  taskList: {
    paddingVertical: 22,
    paddingBottom: 100, // Add padding to account for the peek modal
  },
  calendarContainer: {
    minHeight: 350,
    width: "100%",
    marginVertical: 8,
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: Colours.neutral.tertiary,
  },
  submitButton: {
    backgroundColor: Colours.highlight.primary,
  },
  modalButtonText: {
    color: "white",
    fontSize: 14,
    fontFamily: Fonts.inter.bold,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: Colours.neutral.white,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    gap: 6,
  },
  loadingText: {
    color: Colours.neutral.dark1,
    fontFamily: Fonts.inter.semiBold,
    fontSize: 16,
  },
});

export default TaskListScreen;
