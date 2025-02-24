import React, { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { Subtask, Task } from "../../backend/src/models/types";
import { useUpdateTask } from "../hooks/useUpdateTask";
import AddSubtaskModal from "./AddSubtaskModal";
import Timer from "./Timer";

type SubtaskListProps = {
  task: Task;
};

const SubtaskList = ({ task }: SubtaskListProps) => {
  const { addSubtask, updateSubtask, deleteSubtask, error } = useUpdateTask();

  const [localTask, setLocalTask] = useState<Task>(task);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState("");

  // Update handleOpenModal to reset states
  const handleOpenModal = () => {
    setNewSubtaskName("");
    setModalVisible(true);
  };

  const handleUpdateSubtask = async (subtask: Subtask) => {
    try {
      const updated = await updateSubtask(localTask, subtask);
      if (updated) {
        setLocalTask(updated);
      }
    } catch (err) {
      console.error("Error updating subtask:", err);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const updated = await deleteSubtask(localTask, subtaskId);
      if (updated) {
        setLocalTask(updated);
      }
    } catch (err) {
      console.error("Error deleting subtask:", err);
    }
  };

  return (
    <View style={styles.container}>
      {localTask.subtasks.map((subtask) => (
        <Timer
          key={subtask.id}
          subtask={subtask}
          onUpdate={handleUpdateSubtask}
          onDelete={() => handleDeleteSubtask(subtask.id)}
        />
      ))}

      <Button title="Add Subtask" onPress={handleOpenModal} />

      <AddSubtaskModal
        isOpen={isModalVisible}
        setIsOpen={setModalVisible}
        addSubtask={addSubtask}
        newSubtaskName={newSubtaskName}
        setNewSubtaskName={setNewSubtaskName}
        localTask={localTask}
        setLocalTask={setLocalTask}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default SubtaskList;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  errorText: {
    marginTop: 8,
    color: "red",
  },
});
