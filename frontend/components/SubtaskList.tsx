import { Button, View } from "react-native";
import { Subtask } from "../../backend/src/models/types";
import { taskStyles } from "../styles";
import { EditableSubtask } from "./EditableSubtask";

type SubtaskListProps = {
  subtasks: Subtask[];
  onUpdateSubtask: (index: number, updatedSubtask: Subtask) => void;
  onAddSubtask: () => void;
};

const SubtaskList = ({
  subtasks,
  onUpdateSubtask,
  onAddSubtask,
}: SubtaskListProps) => (
  <View style={taskStyles.subtasksContainer}>
    {subtasks.map((subtask, index) => (
      <EditableSubtask
        key={index}
        subtask={subtask}
        onUpdate={(updatedSubtask) => onUpdateSubtask(index, updatedSubtask)}
      />
    ))}
    <Button title="Add Subtask" onPress={onAddSubtask} />
  </View>
);

export default SubtaskList;
