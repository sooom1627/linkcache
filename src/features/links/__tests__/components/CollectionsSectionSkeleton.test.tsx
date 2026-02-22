import { render } from "@testing-library/react-native";

import { CollectionsSectionSkeleton } from "../../components/CollectionsSectionSkeleton";
import { wrapper } from "../test-utils";

describe("CollectionsSectionSkeleton", () => {
  it("renders without crashing", () => {
    const { getByTestId } = render(<CollectionsSectionSkeleton />, {
      wrapper,
    });

    expect(getByTestId("collections-section-skeleton")).toBeTruthy();
  });

  it("renders multiple skeleton chips", () => {
    const { getAllByTestId } = render(<CollectionsSectionSkeleton />, {
      wrapper,
    });

    const chips = getAllByTestId("collections-skeleton-chip");
    expect(chips.length).toBeGreaterThanOrEqual(3);
    expect(chips.length).toBeLessThanOrEqual(5);
  });
});
