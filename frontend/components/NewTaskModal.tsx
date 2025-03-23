import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Colours } from "../assets/colours";
import { Fonts } from "../assets/fonts";
import BaseText from "./BaseText";

type NewTaskModalProps = {
  selectedDate: string | undefined;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  onAddTask: (taskName: string, subtaskName: string, time?: string) => void;
};

const NewTaskModal = ({
  selectedDate,
  modalVisible,
  setModalVisible,
  onAddTask,
}: NewTaskModalProps) => {
  const [taskName, setTaskName] = React.useState("");
  const [subtaskName, setSubtaskName] = React.useState("");
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [selectedTime, setSelectedTime] = React.useState<Date | undefined>(
    undefined
  );
  const [isFullyExpanded, setIsFullyExpanded] = React.useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const modalHeight = useRef(new Animated.Value(70)).current;
  const currentHeight = useRef(70);
  const maxHeight = 600;
  const minHeight = 70;

  const resetForm = () => {
    setTaskName("");
    setSubtaskName("");
    setSelectedTime(undefined);
    setShowTimePicker(false);
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
      setModalVisible(false);
      resetForm();
    });
  };

  const expandModal = () => {
    if (!selectedDate) return;

    currentHeight.current = maxHeight;
    setIsFullyExpanded(true);
    Animated.spring(modalHeight, {
      toValue: maxHeight,
      friction: 8,
      tension: 65,
      useNativeDriver: false,
    }).start();
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };

  const handleAddTask = () => {
    if (!taskName.trim()) return;
    onAddTask(taskName, subtaskName, selectedTime?.toLocaleTimeString());
    closeModal();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (!selectedDate) return;

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
        if (!selectedDate) return;

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

  useEffect(() => {
    if (!modalVisible) {
      resetForm();
    }
  }, [modalVisible]);

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
        <View style={styles.modalHandle} />

        {/* Peek Content */}
        {!isFullyExpanded && (
          <TouchableOpacity
            style={styles.peekContent}
            onPress={selectedDate ? expandModal : undefined}
            activeOpacity={selectedDate ? 0.7 : 1}
          >
            <Feather
              name="plus"
              size={24}
              color={
                selectedDate ? Colours.highlight.primary : Colours.neutral.light
              }
            />
            <BaseText
              size={16}
              variant="semiBold"
              style={{
                color: selectedDate
                  ? Colours.neutral.dark1
                  : Colours.neutral.light,
              }}
            >
              {selectedDate ? "Add new task" : "Select date to add a new task"}
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
            <BaseText size={20} variant="semiBold">
              Add New Task
            </BaseText>
            <TouchableOpacity onPress={closeModal}>
              <Feather name="x" size={24} color={Colours.neutral.dark1} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Task name"
            value={taskName}
            onChangeText={setTaskName}
          />

          <TextInput
            style={styles.input}
            placeholder="First subtask (2 minutes)"
            value={subtaskName}
            onChangeText={setSubtaskName}
          />

          <View style={styles.dateContainer}>
            <BaseText size={16}>Date</BaseText>
            <BaseText size={14}>{selectedDate}</BaseText>
          </View>

          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <BaseText size={16}>Time</BaseText>
            <BaseText size={14}>
              {selectedTime ? selectedTime.toLocaleTimeString() : "Select time"}
            </BaseText>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime || new Date()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingTop: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colours.neutral.light,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  peekContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  fullModalContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colours.neutral.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: Fonts.inter.regular,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colours.neutral.light,
  },
  timePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colours.neutral.light,
  },
  addButton: {
    backgroundColor: Colours.highlight.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: Colours.neutral.light,
  },
  addButtonText: {
    color: "white",
  },
});

export default NewTaskModal;
