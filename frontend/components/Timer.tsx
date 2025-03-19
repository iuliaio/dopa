import { Colours } from "@/assets/colours";
import { Fonts } from "@/assets/fonts";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Subtask } from "../../backend/src/models/types";

type TimerProps = {
  subtask: Subtask;
  onUpdate: (updatedSubtask: Subtask) => void;
  onDelete: () => void;
};

const Timer = ({ subtask, onUpdate, onDelete }: TimerProps) => {
  const initialTime = subtask.duration ? parseInt(subtask.duration) : 120;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleSaveTimeLeft(0);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);

    // Save progress when pausing
    if (isActive) {
      handleSaveTimeLeft(timeLeft);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
    handleSaveTimeLeft(initialTime);
  };

  const handleSaveTimeLeft = (remainingTime: number) => {
    const updatedSubtask = {
      ...subtask,
      duration: remainingTime.toString(),
    };
    onUpdate(updatedSubtask);
  };

  const formatTime = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    return hours > 0
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`
      : `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <View style={styles.subtaskContainer}>
      <TouchableOpacity onPress={toggleTimer} style={styles.playButton}>
        <Feather
          name={isActive ? "pause" : "play"}
          size={20}
          color={Colours.highlight.primary}
        />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>{subtask.name}</Text>
        <Text style={styles.timerText}>{formatTime()}</Text>
      </View>
      <TouchableOpacity onPress={resetTimer}>
        <Feather
          name="refresh-cw"
          size={20}
          color={Colours.highlight.primary}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete}>
        <Feather name="trash" size={20} color={Colours.highlight.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  subtaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colours.highlight.tertiary,
  },
  playButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: Colours.highlight.tertiary,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameText: {
    fontSize: 16,
    fontFamily: Fonts.inter.semiBold,
    color: Colours.neutral.dark2,
  },
  timerText: {
    fontSize: 14,
    fontFamily: Fonts.inter.regular,
    color: Colours.neutral.dark4,
  },
});

export default Timer;
