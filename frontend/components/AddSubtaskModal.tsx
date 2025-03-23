import { Colours } from "@/assets/colours";
import { Fonts } from "@/assets/fonts";
import React, { useState } from "react";
import {
  Button,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Subtask, Task } from "../../backend/src/models/types";

const MAX_SECONDS = 10800;

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
  setLocalTask: (task: Task) => void;
}) => {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  const addQuickTime = (secs: number) => {
    let total =
      (parseInt(hours) || 0) * 3600 +
      (parseInt(minutes) || 0) * 60 +
      (parseInt(seconds) || 0);
    total = Math.min(total + secs, MAX_SECONDS);

    setHours(String(Math.floor(total / 3600)));
    setMinutes(String(Math.floor((total % 3600) / 60)));
    setSeconds(String(total % 60));
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleSaveNewSubtask = async () => {
    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;
    const s = parseInt(seconds, 10) || 0;

    const totalSeconds = Math.min(h * 3600 + m * 60 + s, MAX_SECONDS);

    try {
      const updated = await addSubtask(localTask, {
        name: newSubtaskName,
        duration: totalSeconds.toString(),
      });

      if (updated) {
        setLocalTask(updated);
        setIsOpen(false);
      }
    } catch (err) {
      console.error("Error saving new subtask:", err);
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

          <TextInput
            style={styles.textInput}
            placeholder="Subtask Name"
            value={newSubtaskName}
            onChangeText={setNewSubtaskName}
          />

          <View style={styles.durationContainer}>
            <TextInput
              style={styles.durationInput}
              value={hours}
              onChangeText={(text) => {
                const num = Math.min(parseInt(text || ""), 3);
                setHours(num ? num.toString() : "");
              }}
              keyboardType="numeric"
              maxLength={1}
              placeholder="HH"
            />
            <Text style={styles.separator}>:</Text>
            <TextInput
              style={styles.durationInput}
              value={minutes}
              onChangeText={(text) => {
                const num = Math.min(parseInt(text || ""), 59);
                setMinutes(num ? num.toString() : "");
              }}
              keyboardType="numeric"
              maxLength={2}
              placeholder="MM"
            />
            <Text style={styles.separator}>:</Text>
            <TextInput
              style={styles.durationInput}
              value={seconds}
              onChangeText={(text) => {
                const num = Math.min(parseInt(text || ""), 59);
                setSeconds(num ? num.toString() : "");
              }}
              keyboardType="numeric"
              maxLength={2}
              placeholder="SS"
            />
          </View>

          <View style={styles.quickAddContainer}>
            {[
              { label: "+30s", value: 30 },
              { label: "+1m", value: 60 },
              { label: "+5m", value: 300 },
            ].map(({ label, value }) => (
              <TouchableOpacity
                key={label}
                onPress={() => addQuickTime(value)}
                style={styles.quickAddButton}
              >
                <Text style={styles.quickAddText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title="Save" onPress={handleSaveNewSubtask} />
          <Button title="Cancel" onPress={handleCloseModal} />
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
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.inter.bold,
    marginBottom: 15,
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
    backgroundColor: "#007AFF",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  quickAddText: {
    color: "white",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  durationInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    width: 50,
    textAlign: "center",
    fontSize: 16,
  },
  separator: {
    fontSize: 18,
    marginHorizontal: 4,
  },
});
