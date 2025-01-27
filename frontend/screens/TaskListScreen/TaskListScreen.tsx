// import TaskCard from "@/components/TaskCard";
// import {
//   ActivityIndicator,
//   Button,
//   FlatList,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import { Task } from "../../../backend/src/models/types";
// import { useTasks } from "../../hooks/useTasks";

// const TaskListScreen = () => {
//   const { tasks, isLoading, error, updateTask, createTask } = useTasks();

//   const handleCreateTask = async () => {
//     try {
//       await createTask();
//     } catch (err) {
//       console.error("Error creating task:", err);
//     }
//   };
//   const handleUpdateTask = async (updatedTask: Task) => {
//     try {
//       await updateTask(updatedTask);
//     } catch (err) {
//       console.error("Error in handleUpdateTask:", err);
//     }
//   };

//   if (isLoading) {
//     return <ActivityIndicator />;
//   }

//   if (error) {
//     return (
//       <View style={styles.error}>
//         <Text>Error: {error}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Button title="Create New Task" onPress={handleCreateTask} />
//       <FlatList
//         data={tasks}
//         renderItem={({ item }) => (
//           <TaskCard task={item} onUpdateTask={handleUpdateTask} />
//         )}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.listContainer}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//   },
//   error: {
//     color: "red",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     fontSize: 24,
//   },
//   listContainer: {
//     padding: 16,
//   },
// });

// export default TaskListScreen;

import { Fonts } from "@/assets/fonts";
import { BaseText, TaskListTypeTabs } from "@/components";
import { useTasks } from "@/hooks/useTasks";
import { TaskListType } from "@/types";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Colours } from "../../assets/colours";

const TaskListScreen = () => {
  const { tasks, isLoading, error, updateTask, createTask } = useTasks();
  const [taskListType, setTaskListType] = useState<TaskListType>("Scheduled");
  const [newTask, setNewTask] = useState("");

  const handleAddTask = () => {
    if (newTask.trim() === "") return;

    const newTaskItem = {
      id: String(tasks.length + 1),
      title: newTask,
      description: "Description",
      type: taskListType,
    };
    setTasks([...tasks, newTaskItem]);
    setNewTask("");
  };

  const renderTask = ({ item }: { item: any }) => (
    <View
      style={[
        styles.taskContainer,
        item.type === "Scheduled" ? styles.scheduledTask : styles.anytimeTask,
      ]}
    >
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription}>{item.description}</Text>
      </View>
      <Feather
        name={item.type === "Scheduled" ? "check" : "chevron-right"}
        size={20}
        color={Colours.neutral.primary}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <BaseText style={styles.title}>All tasks</BaseText>
      <BaseText style={styles.subtitle}>Browse through list</BaseText>

      <TaskListTypeTabs
        onPress={() =>
          setTaskListType(
            taskListType === "Scheduled" ? "Anytime" : "Scheduled"
          )
        }
        taskListType={taskListType}
      />

      {/* Task List */}
      <FlatList
        data={tasks.filter((task) => task.type === taskListType)}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.taskList}
      />

      {/* Add New Task */}
      <View style={styles.newTaskContainer}>
        <TextInput
          style={styles.newTaskInput}
          placeholder="Text"
          value={newTask}
          onChangeText={setNewTask}
        />
        <TouchableOpacity onPress={handleAddTask}>
          <Feather
            name="plus-circle"
            size={24}
            color={Colours.highlight.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Feather name="list" size={24} color={Colours.highlight.primary} />
          <Text style={styles.footerText}>Todo List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Feather name="settings" size={24} color={Colours.neutral.primary} />
          <Text style={styles.footerText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colours.neutral.white,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.inter.bold,
    color: Colours.neutral.dark1,
    marginTop: 24,
  },
  subtitle: {
    color: Colours.neutral.dark3,
    paddingVertical: 24,
  },
  taskList: {
    marginBottom: 20,
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  scheduledTask: {
    backgroundColor: Colours.neutral.light,
  },
  anytimeTask: {
    borderWidth: 1,
    borderColor: Colours.highlight.primary,
  },
  taskContent: {
    flex: 1,
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colours.neutral.dark1,
  },
  taskDescription: {
    fontSize: 14,
    color: Colours.neutral.dark3,
  },
  newTaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colours.neutral.light,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  newTaskInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: Colours.neutral.dark1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colours.neutral.light,
    paddingVertical: 10,
  },
  footerButton: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: Colours.neutral.dark3,
  },
});

export default TaskListScreen;
