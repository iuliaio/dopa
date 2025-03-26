import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Task } from "../../../backend/src/models/types";
import AddSubtaskModal from "../AddSubtaskModal";

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getReactNativePersistence: jest.fn(),
  initializeAuth: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

describe("AddSubtaskModal", () => {
  const mockSetIsOpen = jest.fn();
  const mockSetNewSubtaskName = jest.fn();
  const mockAddSubtask = jest.fn();
  const mockSetLocalTask = jest.fn();

  const baseProps = {
    isOpen: true,
    setIsOpen: mockSetIsOpen,
    addSubtask: mockAddSubtask,
    newSubtaskName: "",
    setNewSubtaskName: mockSetNewSubtaskName,
    localTask: {
      id: "task-123",
      name: "Test Task",
      description: "",
      subtasks: [],
      status: "PENDING",
    } as Task,
    setLocalTask: mockSetLocalTask,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the modal when isOpen is true", () => {
    const { getByText } = render(<AddSubtaskModal {...baseProps} />);
    expect(getByText("Add New Subtask")).toBeTruthy();
  });

  it("does not render the modal content when isOpen is false", () => {
    const { queryByText } = render(
      <AddSubtaskModal {...baseProps} isOpen={false} />
    );
    expect(queryByText("Add New Subtask")).toBeNull();
  });

  it("calls setIsOpen(false) when Cancel is pressed", async () => {
    const { getByText } = render(<AddSubtaskModal {...baseProps} />);
    const cancelButton = getByText("Cancel");
    await act(async () => {
      fireEvent.press(cancelButton);
    });

    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });

  it("disables the Save button if subtask name is empty or no time is set", async () => {
    const { getByText } = render(<AddSubtaskModal {...baseProps} />);
    const saveButton = getByText("Save");
    await act(async () => {
      fireEvent.press(saveButton);
    });
    expect(mockAddSubtask).not.toHaveBeenCalled();
  });

  it("allows user to enter subtask name and time, then calls addSubtask on Save", async () => {
    const newProps = { ...baseProps, newSubtaskName: "My Subtask" };
    const { getByPlaceholderText: getInput, getByText: getTxt } = render(
      <AddSubtaskModal {...newProps} />
    );

    const hoursInput = getInput("HH");
    const minutesInput = getInput("MM");
    const secondsInput = getInput("SS");

    await act(async () => {
      fireEvent.changeText(hoursInput, "1");
      fireEvent.changeText(minutesInput, "30");
      fireEvent.changeText(secondsInput, "15");
    });

    const saveButton = getTxt("Save");
    await act(async () => {
      fireEvent.press(saveButton);
    });

    await waitFor(() => {
      expect(mockAddSubtask).toHaveBeenCalledTimes(1);
      expect(mockAddSubtask).toHaveBeenCalledWith(
        expect.objectContaining({ id: "task-123" }),
        expect.objectContaining({
          name: "My Subtask",
          duration: "5415",
          status: "PENDING",
        })
      );
    });
  });

  it("adds quick time when +5m, +10m, +30m, or +1h is pressed", async () => {
    const { getByText, getByPlaceholderText } = render(
      <AddSubtaskModal {...baseProps} />
    );

    const hoursInput = getByPlaceholderText("HH");
    const minutesInput = getByPlaceholderText("MM");
    const secondsInput = getByPlaceholderText("SS");

    expect(hoursInput.props.value).toBe("");
    expect(minutesInput.props.value).toBe("");
    expect(secondsInput.props.value).toBe("");

    await act(async () => {
      fireEvent.press(getByText("+5m"));
    });
    expect(minutesInput.props.value).toBe("5");
    expect(hoursInput.props.value).toBe("");
    expect(secondsInput.props.value).toBe("");

    await act(async () => {
      fireEvent.press(getByText("+10m"));
    });
    expect(minutesInput.props.value).toBe("15");

    await act(async () => {
      fireEvent.press(getByText("+1h"));
    });
    expect(hoursInput.props.value).toBe("1");

    await act(async () => {
      fireEvent.press(getByText("+30m"));
    });
    expect(hoursInput.props.value).toBe("1");
    expect(minutesInput.props.value).toBe("45");
  });

  it("clamps hours at 3 if user tries to input more than 3 hours", async () => {
    const { getByPlaceholderText } = render(<AddSubtaskModal {...baseProps} />);
    const hoursInput = getByPlaceholderText("HH");
    await act(async () => {
      fireEvent.changeText(hoursInput, "5");
    });
    expect(hoursInput.props.value).toBe("3");
  });
});
