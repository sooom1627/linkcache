import { mergeAddedReadDayRows } from "@/src/features/links/utils/dashboardOverviewMerge";

describe("mergeAddedReadDayRows", () => {
  it("added と read を id でマージし、両方のカウントを保持する", () => {
    const added = [
      {
        id: "a",
        name: "One",
        emoji: null,
        addedCount: 2,
        readCount: 0,
      },
    ];
    const read = [
      {
        id: "a",
        name: "One",
        emoji: null,
        addedCount: 0,
        readCount: 3,
      },
    ];

    const merged = mergeAddedReadDayRows(added, read);

    expect(merged).toHaveLength(1);
    expect(merged[0]).toEqual({
      id: "a",
      name: "One",
      emoji: null,
      addedCount: 2,
      readCount: 3,
    });
  });

  it("added のみの id は readCount 0 で残る", () => {
    const merged = mergeAddedReadDayRows(
      [
        {
          id: "x",
          name: "X",
          emoji: null,
          addedCount: 1,
          readCount: 0,
        },
      ],
      [],
    );

    expect(merged[0]).toMatchObject({
      id: "x",
      addedCount: 1,
      readCount: 0,
    });
  });

  it("read のみの id は addedCount 0 で追加される", () => {
    const merged = mergeAddedReadDayRows(
      [],
      [
        {
          id: "y",
          name: "Y",
          emoji: "📌",
          addedCount: 0,
          readCount: 4,
        },
      ],
    );

    expect(merged[0]).toEqual({
      id: "y",
      name: "Y",
      emoji: "📌",
      addedCount: 0,
      readCount: 4,
    });
  });
});
