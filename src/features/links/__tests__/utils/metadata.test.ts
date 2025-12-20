import { fetchLinkMetadata } from "../../utils/metadata";

// 実際にはネットワークリクエストを行うため、モックを使用するべきですが、
// link-preview-jsの挙動を確認するために一時的にコンソールログ出力などで確認します。
// 本番コードではネットワークリクエストをモックします。

describe("fetchLinkMetadata", () => {
  it("should be defined", () => {
    expect(fetchLinkMetadata).toBeDefined();
  });
});
