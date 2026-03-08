import { fireEvent, render } from "@testing-library/react-native";

import { LinkListFilterModal } from "../../components/LinkListFilterModal";
import { LinkListFilterProvider } from "../../contexts/LinkListFilterContext";
import { wrapper } from "../test-utils";

// BaseBottomSheetModalをモック（childrenをそのままレンダリング）
jest.mock("@/src/shared/components/modals", () => ({
  BaseBottomSheetModal: ({ children }: { children: React.ReactNode }) =>
    children,
}));

const renderWithProvider = (
  onClose: () => void = jest.fn(),
  ref?: React.RefObject<unknown>,
) =>
  render(
    <LinkListFilterProvider>
      <LinkListFilterModal ref={ref as never} onClose={onClose} />
    </LinkListFilterProvider>,
    { wrapper },
  );

describe("LinkListFilterModal", () => {
  it("ステータスオプション選択時にonCloseが呼ばれる", () => {
    const onClose = jest.fn();
    const { getByLabelText } = renderWithProvider(onClose);

    fireEvent.press(getByLabelText("Filter by links.filter.options.read_soon"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("既読状態オプション選択時にonCloseが呼ばれる", () => {
    const onClose = jest.fn();
    const { getByLabelText } = renderWithProvider(onClose);

    fireEvent.press(getByLabelText("Filter by links.filter.options.unread"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
