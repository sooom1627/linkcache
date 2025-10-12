// ESLint 9.x Flat Config形式
// TypeScriptの型補完を有効にするため、ESLint設定の型定義を明示しています。
/** @type {import("eslint").Linter.Config[]} */

const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");
const react = require("eslint-plugin-react");
const importPlugin = require("eslint-plugin-import");
const tailwindcss = require("eslint-plugin-tailwindcss");

module.exports = [
  // グローバルな無視パターン
  {
    ignores: [
      // ビルド成果物
      "dist/**",
      "build/**",
      "coverage/**",
      // 依存関係
      "node_modules/**",
      // 設定ファイル（*.config.* で統一）
      "*.config.js",
      "*.config.cjs",
      "*.config.ts",
      // 型定義ファイル
      "*.d.ts",
      // サンプル・例
      "app-example/**",
    ],
  },

  // メイン設定（全ての.js, .jsx, .ts, .tsxファイル）
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      // TypeScriptコードを解析するためのパーサを指定
      parser: tsparser,
      parserOptions: {
        // tsconfig.jsonを指定し、TypeScriptのプロジェクト構成と型情報を取得
        project: "./tsconfig.json",
        // 最新のECMAScript機能（ESNext）を使用
        ecmaVersion: "latest",
        // moduleを指定することで、import/export構文を使用可能に
        sourceType: "module",
        ecmaFeatures: {
          // JSX構文をサポート（Reactコードの解析に必要）
          jsx: true,
        },
      },
      globals: {
        // React Native グローバル変数
        __DEV__: "readonly",
        // Node.js グローバル変数
        process: "readonly",
        console: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react: react,
      import: importPlugin,
      tailwindcss: tailwindcss,
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
      tailwindcss: {
        // Tailwind設定ファイルの場所
        config: "tailwind.config.js",
        // NativeWindではclassName属性を使用
        callees: ["classnames", "clsx", "cn"],
        classRegex: "^className$",
      },
    },
    rules: {
      // ===== React関連 =====
      // React 17以降ではJSXで明示的にimport Reactが不要
      "react/react-in-jsx-scope": "off",

      // ===== TypeScript関連 =====
      // 未使用の変数を警告しますが、_で始まる引数は無視
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      // 配列型の指定方法に関するルールを無効化
      "@typescript-eslint/array-type": "off",
      // typeとinterfaceの使用を強制しない
      "@typescript-eslint/consistent-type-definitions": "off",
      // 型のインポートをimport typeに統一し、インライン形式を推奨
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      // 非同期関数でawaitを必須とするルールを無効化
      "@typescript-eslint/require-await": "off",
      // Promiseの誤用を防止しますが、特定の属性チェックは無効化
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: { attributes: false },
        },
      ],
      // require構文の使用を許可
      "@typescript-eslint/no-var-requires": "off",

      // ===== 命名規則（React Native/Expo向け最適化版） =====
      "@typescript-eslint/naming-convention": [
        "error",
        // 1. 変数
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          // camelCase: 通常の変数 (const userName = ...)
          // PascalCase: React Component (const UserProfile = () => ...)
          // UPPER_CASE: 定数 (const API_URL = ...)
        },
        // 2. 関数・React Component
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
          // camelCase: 通常の関数 (function fetchData() {})
          // PascalCase: React Component (function UserCard() {})
        },
        // 3. React Component（明示的にPascalCase強制）
        {
          selector: "variable",
          modifiers: ["exported"],
          format: ["PascalCase"],
          // エクスポートされるComponentは必ずPascalCase
          filter: {
            regex: "^(use|create|get|fetch|handle|on)[A-Z]",
            match: false,
          },
        },
        // 4. カスタムフック（必ずuseで始まる）
        {
          selector: "variable",
          modifiers: ["exported"],
          format: ["camelCase"],
          prefix: ["use"],
          filter: {
            regex: "^use[A-Z]",
            match: true,
          },
          // export const useUserData = () => {}
        },
        // 5. 型・インターフェース・Type Alias
        {
          selector: "typeLike",
          format: ["PascalCase"],
          // type UserData = {}
          // interface UserProps {}
        },
        // 6. 型パラメータ（ジェネリクス）
        {
          selector: "typeParameter",
          format: ["PascalCase"],
          prefix: ["T", "K", "V", "P"],
          // <TData>, <TProps>など
        },
        // 7. クラス
        {
          selector: "class",
          format: ["PascalCase"],
        },
        // 8. クラスプロパティ・メソッド
        {
          selector: "classProperty",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "classMethod",
          format: ["camelCase"],
        },
        // 9. パラメータ
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
          // function onClick(_event) {} ← 未使用パラメータ
        },
        // 10. プライベートプロパティ（_始まり）
        {
          selector: "memberLike",
          modifiers: ["private"],
          format: ["camelCase"],
          leadingUnderscore: "require",
          // private _internalState
        },
        // 11. 定数（UPPER_CASE）
        {
          selector: "variable",
          modifiers: ["const"],
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          // const API_BASE_URL = '' (UPPER_CASE)
          // const config = {} (camelCase)
          // const UserComponent = () => {} (PascalCase)
        },
        // 12. グローバル定数（必ずUPPER_CASE）
        {
          selector: "variable",
          modifiers: ["const", "global"],
          format: ["UPPER_CASE"],
        },
        // 13. オブジェクトリテラルのプロパティ（制約なし）
        {
          selector: "objectLiteralProperty",
          format: null,
          // API レスポンスなど外部データに対応
          // { user_name: '...', 'kebab-case': '...' }
        },
        // 14. 破壊的代入での変数名（制約なし）
        {
          selector: "variable",
          modifiers: ["destructured"],
          format: null,
          // const { user_id } = apiResponse;
        },
      ],

      // ===== Import順序 =====
      "import/order": [
        "error",
        {
          groups: [
            "builtin", // Node.js組み込みモジュール
            "external", // node_modulesのパッケージ
            "internal", // プロジェクト内のエイリアス (@/*)
            ["parent", "sibling"], // 親・兄弟ディレクトリ
            "index", // index.ts
            "object",
            "type", // 型インポート
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "react-native",
              group: "external",
              position: "before",
            },
            {
              pattern: "expo-*",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react", "react-native"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      // import文の重複を警告
      "import/no-duplicates": "error",

      // ===== Tailwind CSS (NativeWind) 関連 =====
      // クラス名の順序はPrettierで自動整形されるため無効化
      "tailwindcss/classnames-order": "off",
      // 負の値の記法を統一（-m-4 より -mt-4 を推奨）
      "tailwindcss/enforces-negative-arbitrary-values": "warn",
      // 短縮記法の使用を推奨（mx-4 my-4 より m-4 を推奨）
      "tailwindcss/enforces-shorthand": "warn",
      // 矛盾するクラス名を検出（flex flex-col と flex-row など）
      "tailwindcss/no-contradicting-classname": "error",
      // カスタムクラス名の使用を制限（NativeWindでは基本的にTailwindクラスのみ使用）
      "tailwindcss/no-custom-classname": "warn",
      // 不要な任意値を警告（text-[16px] より text-base を推奨）
      "tailwindcss/no-unnecessary-arbitrary-value": "warn",

      // ===== 未定義型のチェック =====
      // any型の使用を警告
      "@typescript-eslint/no-explicit-any": "warn",
      // 暗黙的なany型を警告
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      // 型アサーション (as) の使用を制限
      "@typescript-eslint/consistent-type-assertions": [
        "warn",
        {
          assertionStyle: "as",
          objectLiteralTypeAssertions: "allow-as-parameter",
        },
      ],
    },
  },

  // Expo Router用の設定: app/ディレクトリではdefault exportを許可
  {
    files: ["app/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "import/no-default-export": "off",
    },
  },
];
