import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import NewTaskModal from "../NewTaskModal";

jest.mock("@react-native-community/datetimepicker", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return (props: any) => (
    <View testID="DateTimePicker">
      <Text>{props.value ? props.value.toString() : "No date"}</Text>
    </View>
  );
});

jest.mock("react-native-vector-icons/Feather", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return (props: any) => <Text testID="icon">{props.name}</Text>;
});

jest.mock("../BaseText", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return (props: any) => (
    <Text {...props} testID="BaseText">
      {props.children}
    </Text>
  );
});

jest.mock("../CustomInput", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return (props: any) => (
    <TextInput
      {...props}
      testID={props.placeholder}
      onChangeText={(text: string) => props.onChangeText(text)}
    />
  );
});

jest.mock("@/utils/dateUtils", () => ({
  formatScheduleDate: (date: string) => `Formatted ${date}`,
}));

describe("NewTaskModal", () => {
  const mockOnAddTask = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders peek content with 'Add new task' when a selectedDate is provided", () => {
    const { getByText } = render(
      <NewTaskModal
        selectedDate="2025-03-23"
        onAddTask={mockOnAddTask}
        taskListType="Scheduled"
      />
    );
    expect(getByText("Add new task")).toBeTruthy();
  });

  it("renders peek content with 'Select date to add a new task' when no date is provided", () => {
    const { getByText } = render(
      <NewTaskModal
        selectedDate={undefined}
        onAddTask={mockOnAddTask}
        taskListType="Scheduled"
      />
    );
    expect(getByText("Select date to add a new task")).toBeTruthy();
  });

  it("expands the modal when peek content is pressed (if selectedDate is provided)", async () => {
    const { getByText, queryByText } = render(
      <NewTaskModal
        selectedDate="2025-03-23"
        onAddTask={mockOnAddTask}
        taskListType="Scheduled"
      />
    );
    expect(queryByText("x")).toBeNull();

    await act(async () => {
      fireEvent.press(getByText("Add new task"));
    });

    // Wait for animation to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(getByText("x")).toBeTruthy();
    });
  });

  it("calls onAddTask with proper values when Add Task is pressed", async () => {
    const { getByText, getByTestId } = render(
      <NewTaskModal
        selectedDate="2025-03-23"
        onAddTask={mockOnAddTask}
        taskListType="Scheduled"
      />
    );

    await act(async () => {
      fireEvent.press(getByText("Add new task"));
    });

    // Wait for animation to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => getByText("x"));

    const taskNameInput = getByTestId("Task name");
    await act(async () => {
      fireEvent.changeText(taskNameInput, "Test Task");
    });

    await act(async () => {
      fireEvent.press(getByText("Add Task"));
    });

    // Wait for any final animations to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(mockOnAddTask).toHaveBeenCalledWith(
        "Test Task",
        "",
        undefined,
        ""
      );
    });
  });
});
