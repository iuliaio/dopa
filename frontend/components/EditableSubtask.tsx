import { useState } from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Subtask } from "../../backend/src/models/types";
import { taskStyles } from "../styles";
import { Timer } from "./Timer";

type EditableSubtaskProps = {
  subtask: Subtask;
  onUpdate: (updatedSubtask: Subtask) => void;
};

export const EditableSubtask = ({
  subtask,
  onUpdate,
}: EditableSubtaskProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(subtask.name);
  const [duration, setDuration] = useState(subtask.duration);

  const handleSave = () => {
    onUpdate({
      ...subtask,
      name,
      duration,
    });
    setIsEditing(false);
  };

  return (
    <View style={taskStyles.subtask}>
      {isEditing ? (
        <View style={taskStyles.editContainer}>
          <TextInput
            style={taskStyles.input}
            value={name}
            onChangeText={setName}
            autoFocus
          />
          <TextInput
            style={taskStyles.input}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="Duration (minutes)"
          />
          <Button title="Save" onPress={handleSave} />
        </View>
      ) : (
        <View style={taskStyles.displayContainer}>
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={taskStyles.nameText}>{name}</Text>
          </TouchableOpacity>
          <Text>Duration: {duration} minutes</Text>
          <Timer initialMinutes={duration} />
        </View>
      )}
    </View>
  );
};
