# .cursor/rules 配下ドキュメント一覧

`.cursor/rules` 配下のルールドキュメントの種類と外観をまとめます。

## 📋 ドキュメント一覧（上流→下流順）

| ファイル名                                 | 種類             | 適用範囲    | サイズ | 主な内容                                     |
| ------------------------------------------ | ---------------- | ----------- | ------ | -------------------------------------------- |
| `business-background-for-this-project.mdc` | プロジェクト背景 | 条件付き    | 58行   | ビジネス要件・MVPスコープ                    |
| `cursol-rules.mdc`                         | 開発ガイドライン | 常時適用    | 109行  | コア原則・技術スタック・コーディング規約     |
| `react-native-expo-architecture.mdc`       | アーキテクチャ   | 常時適用    | 390行  | プロジェクト構造・開発フロー・実装パターン   |
| `simplicity-first-design.mdc`              | 設計原則         | 常時適用    | 305行  | シンプリシティ・ファースト設計・分割判断基準 |
| `localization-and-timezone.mdc`            | 国際化           | 条件付き    | 330行  | 多言語・タイムゾーン実装ガイド               |
| `testing-strategy.mdc`                     | テスト戦略       | `**.test.*` | 348行  | クラシカルTDD・テスト方針・実装例            |
| `feature-documentation-structure.mdc`      | ドキュメント構造 | 条件付き    | 138行  | フィーチャードキュメント標準化               |
| `documentation-quality-principles.mdc`     | ドキュメント品質 | `*.md`      | 170行  | 品質基準・チェックリスト                     |

## 🎨 共通構造

すべてのドキュメントは以下の構造を持ちます：

1. **フロントマター（YAML）**: `description`, `globs`, `alwaysApply`
2. **メインコンテンツ（Markdown）**: タイトル、セクション、コード例、リスト、絵文字アイコン

### 外観の特徴

- **絵文字アイコン**: 📋概要 🎯原則 🚨警告 ✅/❌推奨/非推奨 📏基準 🛠️実践
- **コード例**: TypeScript実装例、❌/✅パターン対比
- **相互参照**: `mdc:` リンクで他のルールや実装ファイルを参照

## 📝 参照順序（上流→下流）

新機能実装時の推奨順序：

**上流（設計段階）**

1. `business-background-for-this-project.mdc` - プロジェクト背景・ビジネス要件
2. `cursol-rules.mdc` - 基本原則・技術スタック
3. `react-native-expo-architecture.mdc` - アーキテクチャ・開発フロー
4. `simplicity-first-design.mdc` - 設計判断基準

**中流（実装段階）** 5. `localization-and-timezone.mdc` - 国際化・タイムゾーン実装（該当時）

**下流（テスト・ドキュメント段階）** 6. `testing-strategy.mdc` - テスト方針 7. `feature-documentation-structure.mdc` - ドキュメント構造 8. `documentation-quality-principles.mdc` - ドキュメント品質
