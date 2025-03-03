import { Colours } from "@/assets/colours";
import { Fonts } from "@/assets/fonts";
import { TaskListType } from "@/types";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import BaseText from "./BaseText";

type TaskListTypeTabsProps = {
  onPress: (taskListType: TaskListType) => void;
  taskListType: TaskListType;
};

const TaskListTypeTabs = ({ onPress, taskListType }: TaskListTypeTabsProps) => {
  return (
    <View style={styles.tabs}>
      <TouchableOpacity style={styles.tab} onPress={() => onPress("Scheduled")}>
        <BaseText
          style={[
            styles.tabText,
            taskListType === "Scheduled" && styles.activeTabText,
          ]}
        >
          Scheduled
        </BaseText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => onPress("Anytime")}>
        <BaseText
          style={[
            styles.tabText,
            taskListType === "Anytime" && styles.activeTabText,
          ]}
        >
          Anytime
        </BaseText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: Colours.highlight.quaternary,
    borderRadius: 8,
    marginBottom: 8,
  },
  tab: {
    padding: 4,
    alignItems: "center",
    width: "50%",
  },
  tabText: {
    paddingVertical: 8,
    textAlign: "center",
    borderRadius: 8,
    color: Colours.neutral.dark3,
    fontSize: 14,
  },
  activeTabText: {
    fontFamily: Fonts.inter.bold,
    backgroundColor: Colours.neutral.white,
    width: "100%",
  },
});

export default TaskListTypeTabs;
