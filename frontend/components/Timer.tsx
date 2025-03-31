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
    // Initialize timer state from subtask duration or default to 2 minutes
    const initialTime = subtask.duration ? parseInt(subtask.duration) : 120;
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isActive, setIsActive] = useState(false);
    const [isCompleted, setIsCompleted] = useState(
      subtask.status === "COMPLETED"
    );

    // Sync timer state when subtask status changes externally
    useEffect(() => {
      if (subtask.status === "COMPLETED") {
        setTimeLeft(0);
        setIsCompleted(true);
      }
    }, [subtask.status]);

    // Expose timer control methods to parent component
    useImperativeHandle(ref, () => ({
      complete: () => {
        completeTimer();
      },
      addFiveMinutes: () => {
        const fiveMinutes = 300;
        const newTime = timeLeft + fiveMinutes;
        setTimeLeft(newTime);
        if (isActive) {
          handleSaveTimeLeft(newTime, "IN_PROGRESS");
          onActiveChange?.(subtask, true, newTime);
        }
      },
    }));

    // Core timer logic: updates every second when active
    // Handles completion and state persistence
    useEffect(() => {
      let interval: NodeJS.Timeout;

      if (isActive && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft((time) => {
            const newTime = time - 1;
            // Only notify parent about time updates when the timer is paused or completed
            if (newTime === 0) {
              onActiveChange?.(subtask, false, newTime);
            }
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

    // Timer control functions that handle state updates and persistence
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

    // Persists timer state to backend and updates parent component
    const handleSaveTimeLeft = (remainingTime: number, status: TaskStatus) => {
      const updatedSubtask = {
        ...subtask,
        duration: remainingTime.toString(),
        status: status,
      };
      onUpdate(updatedSubtask);
    };

    // Format time for display, showing hours only when needed
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
            <TouchableOpacity
              onPress={startTimer}
              style={styles.playButton}
              testID="play-button"
            >
              <Feather name="play" size={20} color={Colours.neutral.light} />
            </TouchableOpacity>
          )}
          {!isCompleted && isActive && (
            <TouchableOpacity
              onPress={pauseTimer}
              style={styles.pauseButton}
              testID="pause-button"
            >
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
              testID="complete-button"
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
          <Text
            style={[styles.nameText, isCompleted && styles.completedText]}
            numberOfLines={2}
          >
            {subtask.name}
          </Text>
          <Text style={styles.timerText}>{formatTime()}</Text>
        </View>
        <View style={{ display: "flex", flexDirection: "row", gap: 8 }}>
          <TouchableOpacity onPress={resetTimer} testID="reset-button">
            <Feather
              name="refresh-cw"
              size={20}
              color={Colours.highlight.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} testID="delete-button">
            <Feather name="trash" size={20} color={Colours.highlight.primary} />
          </TouchableOpacity>
        </View>
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
    marginRight: 8,
  },
  nameText: {
    fontSize: 16,
    fontFamily: Fonts.inter.semiBold,
    color: Colours.neutral.dark2,
    flexShrink: 1,
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
