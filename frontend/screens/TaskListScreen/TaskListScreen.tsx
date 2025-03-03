import { RootStackParamList } from "@/app";
import {
  BaseText,
  CustomInput,
  ScheduledTasksCalendar,
  TaskListTypeTabs,
} from "@/components";
import SingleTaskCard from "@/components/SingleTaskCard";
import { useAddTask } from "@/hooks/useAddTask";
import { useTasks } from "@/hooks/useTasks";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
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
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddTask = async () => {
    await addTask(newTask, taskListType);
    setNewTask("");
    setModalVisible(false);
    refetchTasks();
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
          <ScheduledTasksCalendar />
        </View>
      )}

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

      {addTaskError && <Text style={styles.errorText}>{addTaskError}</Text>}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Feather name="list" size={24} color={Colours.highlight.primary} />
          <Text style={styles.footerText}>Todo List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.footerButton,
            {
              backgroundColor: Colours.neutral.tertiary,
              borderRadius: 16,
              padding: 8,
              marginVertical: 8,
            },
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Feather name="settings" size={24} color={Colours.neutral.primary} />
          <Text style={styles.footerText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* ////////////MODAL/////////// */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add a New Task</Text>
            <CustomInput
              placeholder="Task name"
              value={newTask}
              onChangeText={setNewTask}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddTask}
              >
                <Text style={styles.modalButtonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colours.neutral.white,
  },
  title: {
    fontSize: 24,
    paddingBottom: 16,
    fontFamily: Fonts.inter.bold,
    color: Colours.neutral.dark1,
  },
  taskList: {
    paddingVertical: 22,
  },
  calendarContainer: {
    minHeight: 350,
    width: "100%",
    marginVertical: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colours.neutral.light,
    paddingBottom: 16,
    paddingHorizontal: 32,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colours.neutral.white,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: Colours.neutral.white,
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: Fonts.inter.bold,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
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
});

export default TaskListScreen;
