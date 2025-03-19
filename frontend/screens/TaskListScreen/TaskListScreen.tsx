import { RootStackParamList } from "@/app";
import {
  CustomInput,
  ScheduledTasksCalendar,
  TaskListTypeTabs,
} from "@/components";
import SingleTaskCard from "@/components/SingleTaskCard";
import { useAddTask } from "@/hooks/useAddTask";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useTasks } from "@/hooks/useTasks";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import Feather from "react-native-vector-icons/Feather";
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
  const [newTask, setNewTask] = useState<{
    name: string;
    selectedDate: string | undefined;
    selectedTime: string | undefined;
    firstSubtaskName: string;
  }>({
    name: "",
    selectedDate: undefined,
    selectedTime: undefined,
    firstSubtaskName: "",
  });
  const [showGoogleAuthPrompt, setShowGoogleAuthPrompt] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(undefined);

  const updateState = (key: keyof typeof newTask, value: any) => {
    setNewTask((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddTask = async () => {
    if (!newTask.name.trim()) return;

    if (newTask.selectedDate && !calendarAccessToken) {
      setShowGoogleAuthPrompt(true);
      return;
    }

    await addTask(
      newTask.name,
      newTask.selectedDate,
      newTask.selectedTime,
      newTask.firstSubtaskName
    );
    setNewTask({
      name: "",
      selectedDate: undefined,
      selectedTime: undefined,
      firstSubtaskName: "",
    });
    setModalVisible(false);
    refetchTasks();
  };

  if (taskListLoading) {
    return <ActivityIndicator />;
  }

  const normalizeDate = (scheduleDate: any) => {
    if (!scheduleDate) return null;

    if (typeof scheduleDate === "object" && scheduleDate._seconds) {
      return format(new Date(scheduleDate._seconds * 1000), "yyyy-MM-dd");
    }

    return null;
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setSelectedTime(selectedDate);
      const hours = selectedDate.getHours().toString().padStart(2, "0");
      const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
      updateState("selectedTime", `${hours}:${minutes}`);
    }
  };

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
            setSelectedDate={setSelectedDate}
          />
        </View>
      )}

      <FlatList
        data={filteredTasks}
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
          style={[styles.footerButton, styles.addButton]}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate("Settings")}
        >
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
              value={newTask.name}
              onChangeText={(name) => updateState("name", name)}
            />

            <CustomInput
              placeholder="Choose your first 2 minutes subtask"
              value={newTask.firstSubtaskName}
              onChangeText={(name) => updateState("firstSubtaskName", name)}
            />

            {/* Calendar for Date Selection */}
            <Calendar
              onDayPress={(day: DateData) =>
                updateState("selectedDate", day.dateString)
              }
              markedDates={{
                [newTask.selectedDate || ""]: {
                  selected: true,
                  selectedColor: Colours.highlight.primary,
                },
              }}
            />

            <DateTimePicker
              value={selectedTime || new Date()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />

            {addTaskLoading && (
              <ActivityIndicator style={{ marginVertical: 10 }} />
            )}
            {addTaskError && (
              <Text style={styles.errorText}>{addTaskError}</Text>
            )}

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

      {/* Google Authentication Prompt Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={showGoogleAuthPrompt}
        onRequestClose={() => setShowGoogleAuthPrompt(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Connect to Google Calendar?</Text>
            <Text style={styles.modalText}>
              To add this task to your Google Calendar, you need to connect your
              account.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowGoogleAuthPrompt(false);
                  addTask(
                    newTask.name,
                    newTask.selectedDate,
                    newTask.selectedTime,
                    newTask.firstSubtaskName
                  );
                  setNewTask({
                    name: "",
                    selectedDate: undefined,
                    selectedTime: undefined,
                    firstSubtaskName: "",
                  });
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={async () => {
                  const success = await signInWithGoogle();
                  setShowGoogleAuthPrompt(false);

                  if (success) {
                    await loadSavedToken();
                    addTask(
                      newTask.name,
                      newTask.selectedDate,
                      newTask.selectedTime,
                      newTask.firstSubtaskName
                    );
                    setNewTask({
                      name: "",
                      selectedDate: undefined,
                      selectedTime: undefined,
                      firstSubtaskName: "",
                    });
                    setModalVisible(false);
                  }
                }}
              >
                <Text style={styles.modalButtonText}>Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Colours.neutral.white },
  taskList: { paddingVertical: 22 },
  calendarContainer: { minHeight: 350, width: "100%", marginVertical: 8 },
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
  addButton: {
    backgroundColor: Colours.highlight.primary,
    borderRadius: 16,
    padding: 10,
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
  modalText: {
    marginVertical: 15,
    textAlign: "center",
    fontSize: 14,
  },
  timePickerButton: {
    backgroundColor: Colours.neutral.white,
    borderWidth: 1,
    borderColor: Colours.neutral.light,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  timePickerButtonText: {
    fontSize: 16,
    color: Colours.neutral.dark1,
    fontFamily: Fonts.inter.regular,
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: Fonts.inter.bold,
    marginBottom: 10,
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
  dateButton: {
    marginVertical: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colours.neutral.dark3,
    width: "100%",
    alignItems: "center",
  },
});

export default TaskListScreen;
