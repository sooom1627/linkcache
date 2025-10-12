/** @typedef  {import("prettier").Config} PrettierConfig */
/** @typedef  {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */
/** @type { PrettierConfig | SortImportsConfig } */
const config = {
  // プラグインの順序重要: sort-imports → tailwindcss の順で適用
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],

  // ===== Import順序設定 (Expo SDK 54 + React 19 最適化) =====
  importOrder: [
    // 1. React関連（最優先）
    "^(react/(.*)$)|^(react$)",
    "^(react-native/(.*)$)|^(react-native$)",
    "",
    // 2. Expo関連
    "^(expo(.*)$)|^(expo$)",
    "^@expo/(.*)$",
    "",
    // 3. サードパーティライブラリ
    "<THIRD_PARTY_MODULES>",
    "",
    // 4. 内部エイリアス (@/*)
    "^@/(.*)$",
    "",
    // 5. 相対パス（親ディレクトリ）
    "^[.][.]",
    "",
    // 6. 相対パス（同階層）
    "^[.]",
    "",
    // 7. スタイル・アセット（最後）
    "^.+\\.(css|scss|sass|less)$",
    "^.+\\.(jpg|jpeg|png|gif|svg|webp)$",
  ],

  // TypeScript + JSX + Decorators のパーサーを有効化
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],

  // TypeScript 5.x を明示
  importOrderTypeScriptVersion: "5.0.0",

  // importグループ間に空行を追加
  importOrderSeparation: true,

  // import順序をアルファベット順にソート（大文字小文字を区別しない）
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,

  // 組み込みモジュールを最初にグループ化
  importOrderBuiltinModulesToTop: true,

  // type importを通常のimportと分離
  importOrderTypeImportsToTop: true,

  // ===== Prettierフォーマット設定 (2025年推奨) =====
  // シングルクォート（React/JSでは一般的だが、プロジェクト次第）
  singleQuote: false, // ダブルクォート推奨（TypeScript/React 19標準）

  // セミコロンを必須に
  semi: true,

  // 末尾カンマ（ES5互換性とdiff最小化）
  trailingComma: "all",

  // タブ幅
  tabWidth: 2,

  // アロー関数の括弧を常に付ける
  arrowParens: "always",

  // 1行の最大文字数
  printWidth: 80,

  // タブではなくスペースを使用
  useTabs: false,

  // オブジェクトリテラルの括弧内にスペースを追加
  bracketSpacing: true,

  // JSX の閉じ括弧を同じ行に配置するか
  bracketSameLine: false,

  // Markdownの折り返し（ドキュメント用）
  proseWrap: "preserve", // "always"だと意図しない改行が入るため"preserve"推奨

  // HTMLの空白感度
  htmlWhitespaceSensitivity: "css",

  // 改行コード（LF推奨、Windowsとの互換性考慮ならauto）
  endOfLine: "lf",

  // 引用符の統一（JSX属性）
  jsxSingleQuote: false,

  // Vue/Angularなど他のフレームワーク用（Expoでは不要だが念のため）
  vueIndentScriptAndStyle: false,

  // 埋め込み言語のフォーマット（GraphQL, Markdown内のコードブロックなど）
  embeddedLanguageFormatting: "auto",
};

export default config;