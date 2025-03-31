import { Colours } from "@/assets/colours";
import React, { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { BaseText } from ".";
import { Subtask, Task } from "../../backend/src/models/types";
import { useUpdateTask } from "../hooks/useUpdateTask";
import AddSubtaskModal from "./AddSubtaskModal";
import Timer, { TimerHandle } from "./Timer";

type SubtaskListProps = {
  task: Task;
  onSubtaskActiveChange?: (
    subtask: Subtask,
    isActive: boolean,
    timeLeft: number
  ) => void;
  onTimerRef?: (subtaskId: string, ref: TimerHandle | null) => void;
  onTaskUpdate?: (updatedTask: Task) => void;
};

const SubtaskList = ({
  task,
  onSubtaskActiveChange,
  onTimerRef,
  onTaskUpdate,
}: SubtaskListProps) => {
  const { addSubtask, updateSubtask, deleteSubtask, error } = useUpdateTask();
  // Store references to timer components for external control
  const timerRefs = useRef<Map<string, TimerHandle>>(new Map());

  const [isModalVisible, setModalVisible] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState("");

  const handleOpenModal = () => {
    setNewSubtaskName("");
    setModalVisible(true);
  };

  const handleTimerRef = (subtaskId: string, ref: TimerHandle | null) => {
    if (ref) {
      timerRefs.current.set(subtaskId, ref);
    } else {
      timerRefs.current.delete(subtaskId);
    }
    onTimerRef?.(subtaskId, ref);
  };

  const handleUpdateSubtask = async (subtask: Subtask) => {
    try {
      const updated = await updateSubtask(task, subtask);
      if (updated) {
        onTaskUpdate?.(updated);
        return updated;
      }
    } catch (err) {
      console.error("Error updating subtask:", err);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const updated = await deleteSubtask(task, subtaskId);
      if (updated) {
        onTaskUpdate?.(updated);
      }
    } catch (err) {
      console.error("Error deleting subtask:", err);
    }
  };

  const handleAddNewSubtask = async (
    taskToUpdate: Task,
    newSubtask: Partial<Subtask>
  ) => {
    try {
      const updated = await addSubtask(taskToUpdate, newSubtask);
      if (updated) {
        onTaskUpdate?.(updated);
      }
      return updated;
    } catch (err) {
      console.error("Error adding subtask:", err);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addSubtaskButton}
        onPress={handleOpenModal}
      >
        <Feather
          name="plus"
          size={24}
          color={Colours.neutral.dark1}
          style={{ color: Colours.neutral.secondary }}
        />
        <BaseText
          variant="semiBold"
          size={16}
          style={{ color: Colours.highlight.secondary }}
        >
          Add Subtask
        </BaseText>
      </TouchableOpacity>

      <ScrollView style={styles.scrollContainer}>
        {task.subtasks.map((subtask) => (
          <Timer
            key={subtask.id}
            ref={(ref) => handleTimerRef(subtask.id, ref)}
            subtask={subtask}
            onUpdate={handleUpdateSubtask}
            onDelete={() => handleDeleteSubtask(subtask.id)}
            onActiveChange={onSubtaskActiveChange}
          />
        ))}
      </ScrollView>

      <AddSubtaskModal
        isOpen={isModalVisible}
        setIsOpen={setModalVisible}
        addSubtask={handleAddNewSubtask}
        newSubtaskName={newSubtaskName}
        setNewSubtaskName={setNewSubtaskName}
        localTask={task}
        setLocalTask={onTaskUpdate}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default SubtaskList;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    marginVertical: 16,
    flex: 1,
    width: "100%",
  },
  errorText: {
    marginTop: 8,
    color: "red",
  },
  addSubtaskButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
