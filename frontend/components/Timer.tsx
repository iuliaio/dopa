import { Colours } from "@/assets/colours";
import { Fonts } from "@/assets/fonts";
import { secondsToTime } from "@/utils/timeUtils";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Subtask } from "../../backend/src/models/types";
import { TaskStatus } from "../../backend/src/models/types/Types";

type TimerProps = {
  subtask: Subtask;
  onUpdate: (updatedSubtask: Subtask) => void;
  onDelete: () => void;
  onActiveChange?: (
    subtask: Subtask,
    isActive: boolean,
    timeLeft: number
  ) => void;
};

export type TimerHandle = {
  complete: () => void;
  addFiveMinutes: () => void;
};

const Timer = forwardRef<TimerHandle, TimerProps>(
  ({ subtask, onUpdate, onDelete, onActiveChange }, ref) => {
    const initialTime = subtask.duration ? parseInt(subtask.duration) : 120;
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isActive, setIsActive] = useState(false);
    const [isCompleted, setIsCompleted] = useState(
      subtask.status === "COMPLETED"
    );

    useEffect(() => {
      if (subtask.status === "COMPLETED") {
        setTimeLeft(0);
        setIsCompleted(true);
      }
    }, [subtask.status]);

    useImperativeHandle(ref, () => ({
      complete: () => {
        completeTimer();
      },
      addFiveMinutes: () => {
        const newTime = timeLeft + 300; // Add 5 minutes (300 seconds)
        setTimeLeft(newTime);
        if (isActive) {
          handleSaveTimeLeft(newTime, "IN_PROGRESS");
          onActiveChange?.(subtask, true, newTime);
        }
      },
    }));

    useEffect(() => {
      let interval: NodeJS.Timeout;

      if (isActive && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft((time) => {
            const newTime = time - 1;
            // Notify parent about time updates when active
            onActiveChange?.(subtask, true, newTime);
            return newTime;
          });
        }, 1000);
      } else if (timeLeft === 0) {
        setIsActive(false);
        setIsCompleted(true);
        handleSaveTimeLeft(0, "COMPLETED");
        onActiveChange?.(subtask, false, 0);
      }

      return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const startTimer = () => {
      setIsActive(true);
      handleSaveTimeLeft(timeLeft, "IN_PROGRESS");
      onActiveChange?.(subtask, true, timeLeft);
    };

    const pauseTimer = () => {
      setIsActive(false);
      handleSaveTimeLeft(timeLeft, "PENDING");
      onActiveChange?.(subtask, false, timeLeft);
    };

    const completeTimer = () => {
      setIsActive(false);
      setTimeLeft(0);
      setIsCompleted(true);
      handleSaveTimeLeft(0, "COMPLETED");
      onActiveChange?.(subtask, false, 0);
    };

    const resetTimer = () => {
      setIsActive(false);
      setTimeLeft(initialTime);
      setIsCompleted(false);
      handleSaveTimeLeft(initialTime, "PENDING");
      onActiveChange?.(subtask, false, initialTime);
    };

    const handleSaveTimeLeft = (remainingTime: number, status: TaskStatus) => {
      const updatedSubtask = {
        ...subtask,
        duration: remainingTime.toString(),
        status: status,
      };
      onUpdate(updatedSubtask);
    };

    const formatTime = () => {
      const { hours, minutes, seconds } = secondsToTime(timeLeft);
      return hours > 0
        ? `${hours}:${String(minutes).padStart(2, "0")}:${String(
            seconds
          ).padStart(2, "0")}`
        : `${minutes}:${String(seconds).padStart(2, "0")}`;
    };

    return (
      <View style={styles.subtaskContainer}>
        <View style={styles.buttonGroup}>
          {!isCompleted && !isActive && (
            <TouchableOpacity onPress={startTimer} style={styles.playButton}>
              <Feather name="play" size={20} color={Colours.neutral.light} />
            </TouchableOpacity>
          )}
          {!isCompleted && isActive && (
            <TouchableOpacity onPress={pauseTimer} style={styles.pauseButton}>
              <Feather
                name="pause"
                size={20}
                color={Colours.neutral.tertiary}
              />
            </TouchableOpacity>
          )}
          {isCompleted && (
            <TouchableOpacity
              onPress={completeTimer}
              style={styles.completeButton}
            >
              <Feather
                name="check"
                size={20}
                color={Colours.support.success.primary}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.nameText, isCompleted && styles.completedText]}>
            {subtask.name}
          </Text>
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
  }
);

const styles = StyleSheet.create({
  subtaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colours.highlight.tertiary,
    borderTopWidth: 1,
    borderTopColor: Colours.highlight.tertiary,
    width: "100%",
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  playButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: Colours.neutral.primary,
  },
  pauseButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: Colours.highlight.tertiary,
  },
  completeButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: Colours.support.success.secondary,
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
  completedText: {
    textDecorationLine: "line-through",
    color: Colours.neutral.dark4,
  },
  timerText: {
    fontSize: 14,
    fontFamily: Fonts.inter.regular,
    color: Colours.neutral.dark4,
  },
});

export default Timer;
