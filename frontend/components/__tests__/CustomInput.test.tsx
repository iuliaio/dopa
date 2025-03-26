import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Colours } from "../../assets/colours";
import CustomInput from "../CustomInput";

jest.mock("react-native-vector-icons/Feather", () => {
  return jest.fn(({ name, size, color }) => {
    return { props: { name, size, color }, type: "Icon" };
  });
});

describe("CustomInput", () => {
  it("renders correctly with default props", () => {
    const { getByTestId } = render(<CustomInput testID="custom-input" />);
    const input = getByTestId("custom-input");
    expect(input).toBeTruthy();
  });

  it("displays label when provided", () => {
    const { getByText } = render(<CustomInput label="Username" />);
    expect(getByText("Username")).toBeTruthy();
  });

  it("applies focused styles when isFocused is true", () => {
    const { getByTestId } = render(
      <CustomInput testID="focused-input" isFocused={true} />
    );

    const input = getByTestId("focused-input");
    expect(input.props.style[1].borderColor).toBe(Colours.highlight.primary);
  });

  it("applies custom styles when style prop is provided", () => {
    const customStyle = { backgroundColor: "red" };
    const { getByTestId } = render(
      <CustomInput testID="styled-input" style={customStyle} />
    );

    const input = getByTestId("styled-input");
    expect(input.props.style[2]).toEqual(customStyle);
  });

  it("handles text input changes", () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <CustomInput testID="input" onChangeText={onChangeText} />
    );

    const input = getByTestId("input");
    fireEvent.changeText(input, "test value");
    expect(onChangeText).toHaveBeenCalledWith("test value");
  });
});
