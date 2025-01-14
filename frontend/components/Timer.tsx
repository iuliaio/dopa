import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

type TimerProps = {
  initialMinutes: string;
};

export const Timer = ({ initialMinutes }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(parseInt(initialMinutes) * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(parseInt(initialMinutes) * 60);
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timerText}>{formatTime()}</Text>
      <View style={styles.buttonContainer}>
        <Button
          title={isActive ? "Pause" : "Start"}
          onPress={toggleTimer}
          color={isActive ? "#ff6b6b" : "#51cf66"}
        />
        <Button title="Reset" onPress={resetTimer} color="#339af0" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    marginVertical: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
