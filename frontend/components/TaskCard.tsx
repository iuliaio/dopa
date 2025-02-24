import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Subtask, Task } from "../../backend/src/models/types";
import { Colours } from "../assets/colours";
import SubtaskList from "./SubtaskList";

type TaskCardProps = {
  task: Task;
  onUpdateTask: (updatedTask: Task) => void;
  onPress: () => void;
};

const TaskCard = ({ task, onUpdateTask, onPress }: TaskCardProps) => {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);

  const handleSave = () => {
    onUpdateTask({
      ...task,
      name,
      description,
    });
  };

  //TODO - delete or modify
  const handleUpdateSubtask = (index: number, updatedSubtask: Subtask) => {
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[index] = updatedSubtask;
    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
    });
  };

  const handleAddSubtask = () => {
    const newSubtask: Subtask = {
      id: `${Date.now()}`,
      name: "New Subtask",
      status: "PENDING",
      duration: "2",
    };

    onUpdateTask({
      ...task,
      subtasks: [...(task.subtasks || []), newSubtask],
    });
  };

  return (
    <View style={styles.card}>
      {/* {isEditing ? (
        <View>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Task name"
          />
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Task description"
            multiline
          />
          <Button title="Save" onPress={handleSave} />
        </View>
      ) : ( */}
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.taskTitle}>{name}</Text>
        <Text style={styles.taskDescription}>{description}</Text>
      </TouchableOpacity>
      {/* )} */}
      <SubtaskList task={task} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: Colours.neutral.lightest,
  },
  input: {
    borderWidth: 1,
    borderColor: Colours.neutral.dark3,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colours.neutral.dark1,
  },
  taskDescription: {
    fontSize: 14,
    color: Colours.neutral.dark3,
  },
});

export default TaskCard;
