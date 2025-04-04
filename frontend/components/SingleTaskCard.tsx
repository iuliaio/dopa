import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Task } from "../../backend/src/models/types";
import { Colours } from "../assets/colours";
import { Fonts } from "../assets/fonts";

type SingleTaskCardProps = {
  task: Task;
  onPress: () => void;
};

const SingleTaskCard = ({ task, onPress }: SingleTaskCardProps) => {
  const isCompleted = task.status === "COMPLETED";

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCompleted ? styles.completedTask : styles.incompleteTask,
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{task.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {task.description || "No description available"}
        </Text>
      </View>
      <Feather
        name={isCompleted ? "check" : "chevron-right"}
        size={20}
        color={
          isCompleted ? Colours.highlight.primary : Colours.neutral.primary
        }
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  completedTask: {
    backgroundColor: Colours.neutral.lightest,
  },
  incompleteTask: {
    backgroundColor: Colours.neutral.white,
    borderWidth: 1,
    borderColor: Colours.highlight.tertiary,
  },
  content: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.inter.bold,
    color: Colours.neutral.dark1,
  },
  description: {
    fontSize: 12,
    fontFamily: Fonts.inter.regular,
    color: Colours.neutral.dark3,
    marginTop: 4,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SingleTaskCard;
