import { formatScheduleDate } from "@/utils/dateUtils";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Colours } from "../assets/colours";
import { TaskListType } from "../types/Types";
import BaseText from "./BaseText";
import CustomInput from "./CustomInput";

type NewTaskModalProps = {
  selectedDate: string | undefined;
  taskListType: TaskListType;
  onAddTask: (
    taskName: string,
    subtaskName: string,
    time?: string,
    description?: string
  ) => void;
};

const NewTaskModal = ({
  selectedDate,
  taskListType,
  onAddTask,
}: NewTaskModalProps) => {
  const [taskName, setTaskName] = useState("");
  const [subtaskName, setSubtaskName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(undefined);
  const [isFullyExpanded, setIsFullyExpanded] = useState(false);

  const maxHeight = 650;
  const minHeight = 70;
  const modalHeight = useRef(new Animated.Value(70)).current;
  const currentHeight = useRef(minHeight);

  const resetForm = () => {
    setTaskName("");
    setSubtaskName("");
    setDescription("");
    setSelectedTime(undefined);
    setIsFullyExpanded(false);
  };

  const closeModal = () => {
    currentHeight.current = minHeight;
    setIsFullyExpanded(false);
    Animated.spring(modalHeight, {
      toValue: minHeight,
      friction: 8,
      tension: 65,
      useNativeDriver: false,
    }).start(() => {
      resetForm();
    });
  };

  const expandModal = () => {
    if (taskListType === "Scheduled" && !selectedDate) return;

    currentHeight.current = maxHeight;
    setIsFullyExpanded(true);
    Animated.spring(modalHeight, {
      toValue: maxHeight,
      friction: 8,
      tension: 65,
      useNativeDriver: false,
    }).start();
  };

  const handleAddTask = () => {
    if (!taskName.trim()) return;
    onAddTask(
      taskName,
      subtaskName,
      selectedTime?.toLocaleTimeString(),
      description
    );
    closeModal();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (taskListType === "Scheduled" && !selectedDate) return;

        const newHeight = Math.max(
          minHeight,
          Math.min(maxHeight, currentHeight.current - gestureState.dy)
        );
        currentHeight.current = newHeight;
        Animated.timing(modalHeight, {
          toValue: newHeight,
          duration: 0,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderRelease: (_, gestureState) => {
        if (taskListType === "Scheduled" && !selectedDate) return;

        const shouldOpen =
          gestureState.dy < -50 || currentHeight.current > maxHeight / 2;
        if (shouldOpen) {
          expandModal();
        } else {
          closeModal();
        }
      },
    })
  ).current;

  const canExpand =
    taskListType === "Anytime" ||
    (taskListType === "Scheduled" && selectedDate);

  return (
    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
      <Animated.View
        style={[
          styles.slidableModal,
          {
            height: modalHeight,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {!isFullyExpanded && (
          <TouchableOpacity
            style={styles.peekContent}
            onPress={canExpand ? expandModal : undefined}
            activeOpacity={canExpand ? 0.7 : 1}
          >
            <Feather
              name="plus"
              size={24}
              color={
                canExpand
                  ? Colours.highlight.primary
                  : Colours.neutral.quaternary
              }
            />
            <BaseText
              size={16}
              variant="semiBold"
              style={{
                color: canExpand
                  ? Colours.neutral.dark1
                  : Colours.neutral.quaternary,
              }}
            >
              {taskListType === "Scheduled" && !selectedDate
                ? "Select date to add a new task"
                : "Add new task"}
            </BaseText>
          </TouchableOpacity>
        )}

        {/* Full Modal Content */}
        <Animated.View
          style={[
            styles.fullModalContent,
            {
              opacity: modalHeight.interpolate({
                inputRange: [minHeight, maxHeight],
                outputRange: [0, 1],
              }),
              display: isFullyExpanded ? "flex" : "none",
            },
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={closeModal}>
              <Feather name="x" size={24} color={Colours.neutral.dark5} />
            </TouchableOpacity>
          </View>

          {taskListType === "Scheduled" && selectedDate && (
            <View style={{ paddingBottom: 12 }}>
              <BaseText
                size={18}
                variant="semiBold"
                style={{ color: Colours.neutral.dark1 }}
              >
                {formatScheduleDate(selectedDate)}
              </BaseText>
            </View>
          )}

          <View style={{ gap: 16 }}>
            <CustomInput
              placeholder="Task name"
              value={taskName}
              onChangeText={setTaskName}
            />
            <CustomInput
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
            <CustomInput
              label="Choose the first subtask to get you started"
              placeholder="First subtask (duration 2 minutes)"
              value={subtaskName}
              onChangeText={setSubtaskName}
            />
          </View>

          {taskListType === "Scheduled" && (
            <View>
              <BaseText
                size={16}
                variant="semiBold"
                style={{ color: Colours.neutral.dark1, marginTop: 12 }}
              >
                Time
              </BaseText>
              <View style={styles.timePickerSection}>
                <DateTimePicker
                  value={selectedTime || new Date()}
                  mode="time"
                  display="spinner"
                  onChange={(event, time) => {
                    if (event.type === "set" && time) {
                      setSelectedTime(time);
                    }
                  }}
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.addButton,
              !taskName.trim() && styles.disabledButton,
            ]}
            onPress={handleAddTask}
            disabled={!taskName.trim()}
          >
            <BaseText size={16} variant="semiBold" style={styles.addButtonText}>
              Add Task
            </BaseText>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  slidableModal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colours.neutral.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingTop: 8,
  },
  peekContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  fullModalContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  timePickerSection: {
    alignItems: "center",
  },
  addButton: {
    backgroundColor: Colours.highlight.secondary,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    width: "80%",
    alignSelf: "center",
  },
  disabledButton: {
    backgroundColor: Colours.neutral.light,
  },
  addButtonText: {
    color: "white",
  },
});

export default NewTaskModal;
