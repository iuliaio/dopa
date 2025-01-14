import { render } from "@testing-library/react-native";
import { TaskListScreen } from ".";

describe("TaskListScreen", () => {
  it("renders correctly", () => {
    const { getByRole } = render(<TaskListScreen />);

    getByRole("button", { name: "Create New Task" }); //TODO: Fix this test, currently failing because of the ActivityIndicator loading view
  });
});
