import React, { useState } from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Subtask, Task } from "../../backend/src/models/types";
import { taskStyles } from "../styles";
import SubtaskList from "./SubtaskList";

type TaskCardProps = {
  task: Task;
  onUpdateTask: (updatedTask: Task) => void;
};

export const TaskCard = ({ task, onUpdateTask }: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);

  const handleSave = () => {
    onUpdateTask({
      ...task,
      name,
      description,
    });
    setIsEditing(false);
  };

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
      name: "Change name here",
      status: "pending",
      duration: "2",
    };

    onUpdateTask({
      ...task,
      subtasks: [...(task.subtasks || []), newSubtask],
    });
  };

  return (
    <View style={taskStyles.taskCard}>
      {isEditing ? (
        <View style={taskStyles.editContainer}>
          <TextInput
            style={taskStyles.input}
            value={name}
            onChangeText={setName}
            placeholder="Task name"
          />
          <TextInput
            style={taskStyles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Task description"
            multiline
          />
          <Button title="Save" onPress={handleSave} />
        </View>
      ) : (
        <>
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={taskStyles.taskName}>{name}</Text>
            <Text style={taskStyles.taskDescription}>{description}</Text>
          </TouchableOpacity>
          <Text style={taskStyles.taskStatus}>Status: {task.status}</Text>
          <SubtaskList
            subtasks={task.subtasks}
            onUpdateSubtask={handleUpdateSubtask}
            onAddSubtask={handleAddSubtask}
          />
        </>
      )}
    </View>
  );
};
