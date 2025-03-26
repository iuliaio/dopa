/// <reference types="jest" />
import "@testing-library/jest-native/extend-expect";
import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Subtask } from "../../../backend/src/models/types";
import Timer from "../Timer";

jest.mock("react-native-vector-icons/Feather", () => "Icon");

describe("Timer", () => {
  const mockSubtask: Subtask = {
    id: "1",
    name: "Test Task",
    duration: "120",
    status: "PENDING",
  };

  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnActiveChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders correctly with initial state", () => {
    const { getByText } = render(
      <Timer
        subtask={mockSubtask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onActiveChange={mockOnActiveChange}
      />
    );

    expect(getByText("Test Task")).toBeTruthy();
    expect(getByText("2:00")).toBeTruthy();
  });

  it("starts and updates timer when play is pressed", () => {
    const { getByTestId, getByText } = render(
      <Timer
        subtask={mockSubtask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onActiveChange={mockOnActiveChange}
      />
    );

    const playButton = getByTestId("play-button");
    fireEvent.press(playButton);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockSubtask,
      status: "IN_PROGRESS",
      duration: "120",
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(getByText("1:59")).toBeTruthy();
  });

  it("pauses timer when pause is pressed", () => {
    const { getByTestId } = render(
      <Timer
        subtask={mockSubtask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onActiveChange={mockOnActiveChange}
      />
    );

    fireEvent.press(getByTestId("play-button"));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    fireEvent.press(getByTestId("pause-button"));

    expect(mockOnUpdate).toHaveBeenLastCalledWith({
      ...mockSubtask,
      status: "PENDING",
      duration: "119",
    });
  });

  it("resets timer when reset is pressed", () => {
    const { getByTestId, getByText } = render(
      <Timer
        subtask={mockSubtask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onActiveChange={mockOnActiveChange}
      />
    );

    fireEvent.press(getByTestId("play-button"));
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    fireEvent.press(getByTestId("reset-button"));

    expect(mockOnUpdate).toHaveBeenLastCalledWith({
      ...mockSubtask,
      status: "PENDING",
      duration: "120",
    });
    expect(getByText("2:00")).toBeTruthy();
  });

  it("completes timer when time runs out", () => {
    const { getByTestId } = render(
      <Timer
        subtask={mockSubtask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onActiveChange={mockOnActiveChange}
      />
    );

    fireEvent.press(getByTestId("play-button"));

    act(() => {
      jest.advanceTimersByTime(120000);
    });

    expect(mockOnUpdate).toHaveBeenLastCalledWith({
      ...mockSubtask,
      status: "COMPLETED",
      duration: "0",
    });
  });

  it("deletes timer when delete is pressed", () => {
    const { getByTestId } = render(
      <Timer
        subtask={mockSubtask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onActiveChange={mockOnActiveChange}
      />
    );

    fireEvent.press(getByTestId("delete-button"));
    expect(mockOnDelete).toHaveBeenCalled();
  });
});
