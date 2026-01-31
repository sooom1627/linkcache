import { fireEvent, render, screen } from "@testing-library/react-native";

import { ErrorStateView } from "../../components/ErrorStateView";

describe("ErrorStateView", () => {
  it("renders error message", () => {
    render(<ErrorStateView message="Network connection failed" />);

    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(screen.getByText("Network connection failed")).toBeTruthy();
  });

  it("renders action button when provided", () => {
    const onAction = jest.fn();
    render(
      <ErrorStateView
        message="Failed to load"
        actionLabel="Try Again"
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Try Again")).toBeTruthy();
  });

  it("does not render action button when not provided", () => {
    render(<ErrorStateView message="Error occurred" />);

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("calls onAction when button is pressed", () => {
    const onAction = jest.fn();
    render(
      <ErrorStateView
        message="Failed to load"
        actionLabel="Retry"
        onAction={onAction}
      />,
    );

    fireEvent.press(screen.getByText("Retry"));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
