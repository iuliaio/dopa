import { Colours } from "@/assets/colours";
import { Fonts } from "@/assets/fonts";
import React, { useState } from "react";
import {
  Button,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BaseText, CustomInput } from ".";
import { Subtask, Task } from "../../backend/src/models/types";
import {
  calculateTotalSeconds,
  formatTimeValue,
  MAX_SECONDS,
  parseTimeValue,
  secondsToTime,
} from "../utils/timeUtils";

const AddSubtaskModal = ({
  isOpen,
  setIsOpen,
  addSubtask,
  newSubtaskName,
  setNewSubtaskName,
  localTask,
  setLocalTask,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addSubtask: (task: Task, newSubtask: Partial<Subtask>) => Promise<any>;
  newSubtaskName: string;
  setNewSubtaskName: (newSubtaskName: string) => void;
  localTask: Task;
  setLocalTask?: (task: Task) => void;
}) => {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const addQuickTime = (additionalSeconds: number) => {
    const currentH = parseTimeValue(hours, 3);
    const currentM = parseTimeValue(minutes, 59);
    const currentS = parseTimeValue(seconds, 59);

    const totalSeconds = calculateTotalSeconds(currentH, currentM, currentS);
    const newTotal = Math.min(totalSeconds + additionalSeconds, MAX_SECONDS);

    const { hours: h, minutes: m, seconds: s } = secondsToTime(newTotal);
    setHours(formatTimeValue(h));
    setMinutes(formatTimeValue(m));
    setSeconds(formatTimeValue(s));
  };

  const handleTimeInput = (
    value: string,
    setter: (value: string) => void,
    maxValue: number
  ) => {
    const num = parseTimeValue(value, maxValue);
    setter(num ? formatTimeValue(num) : "");
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setNewSubtaskName("");
    setHours("");
    setMinutes("");
    setSeconds("");
    setFocusedInput(null);
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskName.trim()) {
      return;
    }

    const h = parseTimeValue(hours, 3);
    const m = parseTimeValue(minutes, 59);
    const s = parseTimeValue(seconds, 59);
    const totalSeconds = calculateTotalSeconds(h, m, s);

    const newSubtask: Partial<Subtask> = {
      name: newSubtaskName.trim(),
      duration: totalSeconds.toString(),
      status: "PENDING",
    };

    const updatedTask = await addSubtask(localTask, newSubtask);
    if (updatedTask) {
      setLocalTask?.(updatedTask);
      setNewSubtaskName("");
      setIsOpen(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add New Subtask</Text>

          <CustomInput
            placeholder="Subtask Name"
            value={newSubtaskName}
            onChangeText={setNewSubtaskName}
          />

          <BaseText
            size={14}
            style={{
              textAlign: "center",
              color: Colours.support.warning.primary,
            }}
          >
            The subtask shouldn't take more than 3 hours. If it does, try to
            break it down into smaller subtasks.
          </BaseText>
          <View style={styles.durationContainer}>
            <CustomInput
              style={styles.durationInput}
              value={hours}
              onChangeText={(text) => handleTimeInput(text, setHours, 3)}
              keyboardType="numeric"
              maxLength={1}
              placeholder="HH"
              isFocused={focusedInput === "hours"}
              onFocus={() => setFocusedInput("hours")}
              onBlur={() => setFocusedInput(null)}
            />
            <Text style={styles.separator}>:</Text>
            <CustomInput
              style={styles.durationInput}
              value={minutes}
              onChangeText={(text) => handleTimeInput(text, setMinutes, 59)}
              keyboardType="numeric"
              maxLength={2}
              placeholder="MM"
              isFocused={focusedInput === "minutes"}
              onFocus={() => setFocusedInput("minutes")}
              onBlur={() => setFocusedInput(null)}
            />
            <Text style={styles.separator}>:</Text>
            <CustomInput
              style={styles.durationInput}
              value={seconds}
              onChangeText={(text) => handleTimeInput(text, setSeconds, 59)}
              keyboardType="numeric"
              maxLength={2}
              placeholder="SS"
              isFocused={focusedInput === "seconds"}
              onFocus={() => setFocusedInput("seconds")}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View style={styles.quickAddContainer}>
            {[
              { label: "+5m", value: 300 },
              { label: "+10m", value: 600 },
              { label: "+30m", value: 1800 },
              { label: "+1h", value: 3600 },
            ].map(({ label, value }) => (
              <TouchableOpacity
                key={label}
                onPress={() => addQuickTime(value)}
                style={styles.quickAddButton}
              >
                <BaseText variant="semiBold" style={styles.quickAddText}>
                  {label}
                </BaseText>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonsContainer}>
            <Button title="Cancel" onPress={handleCloseModal} />
            <Button
              title="Save"
              onPress={handleAddSubtask}
              disabled={
                !newSubtaskName.trim() || (!hours && !minutes && !seconds)
              }
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
export default AddSubtaskModal;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalView: {
    backgroundColor: Colours.neutral.white,
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    elevation: 5,
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.inter.bold,
    marginBottom: 16,
  },
  textInput: {
    borderColor: Colours.neutral.light,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    width: "100%",
    fontSize: 16,
  },
  quickAddContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  quickAddButton: {
    backgroundColor: Colours.neutral.secondary,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    minWidth: 65,
  },
  quickAddText: {
    color: Colours.neutral.lightest,
    textAlign: "center",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  durationInput: {
    width: 50,
    textAlign: "center",
    fontSize: 16,
    padding: 10,
  },
  separator: {
    fontSize: 18,
    marginHorizontal: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 12,
  },
});
