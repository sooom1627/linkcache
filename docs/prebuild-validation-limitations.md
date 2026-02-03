# Prebuildで確認できること・できないこと

## 概要

`npx expo prebuild`は、Xcodeのセットアップなしで実行できますが、**実際のビルドは行いません**。そのため、確認できることとできないことがあります。

## ✅ Prebuildで確認できること

### 1. Config Pluginの実行エラー

Config Plugin（`plugins/withShareExtension.ts`など）の実行時に発生するエラーは検出できます：

- **ファイルの存在確認**: Config Pluginが参照するファイルが存在するか
- **構文エラー**: TypeScript/JavaScriptの構文エラー
- **実行時エラー**: Config Pluginの実行中に発生するエラー

**例:**

```bash
# エラー例
Error: Failed to add ShareExtension target
Error: File not found: targets/share-extension/ShareViewController.swift
```

### 2. app.config.js/app.jsonの検証

設定ファイルの構文エラーや基本的な検証は行われます：

- **構文エラー**: JSON/JavaScriptの構文エラー
- **必須フィールド**: 必須の設定項目が存在するか
- **型の検証**: 設定値の型が正しいか（一部）

**例:**

```bash
# エラー例
Error: Invalid app.json: "version" must be a string
Error: Missing required field: "slug"
```

### 3. ネイティブプロジェクトファイルの生成

`ios/` と `android/` ディレクトリが正しく生成されるか確認できます：

- **プロジェクトファイルの生成**: `.xcodeproj` や `build.gradle` が生成されるか
- **ファイル構造**: 必要なファイルが正しい場所に配置されるか

**例:**

```bash
# 成功時
✅ Created ios directory
✅ Created android directory
```

### 4. 設定値の整合性

一部の設定値の整合性は確認できます：

- **Bundle Identifier**: フォーマットが正しいか
- **依存関係**: package.jsonの依存関係とConfig Pluginの整合性

## ❌ Prebuildで確認できないこと

### 1. 実際のビルドエラー

**コンパイルエラー**や**リンクエラー**は検出できません：

- ❌ Swift/Objective-Cのコンパイルエラー
- ❌ リンクエラー（ライブラリが見つからないなど）
- ❌ ビルドスクリプトのエラー（`ccache-clang.sh`が見つからないなど）
- ❌ コード署名のエラー

**例（今回のエラー）:**

```
unable to spawn process '/../../node_modules/react-native/scripts/xcode/ccache-clang.sh' (No such file or directory)
```

このエラーは**prebuildでは検出できません**。実際にXcodeでビルドするか、EAS Buildを実行するまで分かりません。

### 2. 実行時エラー

アプリの実行時に発生するエラーは検出できません：

- ❌ ランタイムエラー
- ❌ メモリリーク
- ❌ パフォーマンス問題

### 3. 依存関係のビルドエラー

ネイティブ依存関係のビルドエラーは検出できません：

- ❌ CocoaPodsのビルドエラー
- ❌ ネイティブモジュールのコンパイルエラー

## 🔍 Prebuildの実行結果から分かること

### 成功時

```bash
npx expo prebuild
```

成功すると：

- ✅ `ios/` ディレクトリが生成される
- ✅ `android/` ディレクトリが生成される
- ✅ Config Pluginが正常に実行された
- ✅ 設定ファイルに問題がない

**しかし、これだけでは実際のビルドが成功する保証はありません。**

### 失敗時

```bash
npx expo prebuild
# Error: ...
```

失敗すると：

- ❌ Config Pluginにエラーがある
- ❌ 設定ファイルに問題がある
- ❌ 必要なファイルが存在しない

## 💡 実際のビルドエラーを検知する方法

### 1. EAS Buildを使用（推奨）

実際のビルドを試行してエラーを検出：

```bash
eas build --platform ios --profile dev
```

**メリット:**

- ✅ 実際のビルド環境で検証
- ✅ すべてのビルドエラーを検出
- ✅ コード署名も検証

**デメリット:**

- ❌ ビルド数の上限がある
- ❌ 時間がかかる（10-30分）

### 2. ローカルでXcodeを使用（Xcodeセットアップが必要）

Xcodeをインストールしてローカルでビルド：

```bash
npx expo prebuild
cd ios
xcodebuild -workspace *.xcworkspace -scheme <scheme-name> -configuration Debug
```

**メリット:**

- ✅ 無制限にビルド可能
- ✅ 高速なフィードバック

**デメリット:**

- ❌ Xcodeのセットアップが必要
- ❌ macOSが必要

### 3. Config Pluginで可能な限り検証

Config Plugin内で、ビルド設定の問題を可能な限り検証：

```typescript
// plugins/withShareExtension.ts
const withShareExtension: ConfigPlugin = (config, options) => {
  // ビルド設定を修正してエラーを防ぐ
  buildSettings["CC"] = undefined; // React Nativeスクリプト参照を削除
  // ...
};
```

**メリット:**

- ✅ prebuild時に自動実行
- ✅ Xcodeセットアップ不要

**デメリット:**

- ❌ すべてのビルドエラーを防げるわけではない

## 📋 まとめ

| 項目                         | Prebuildで確認可能 | 備考                                 |
| ---------------------------- | ------------------ | ------------------------------------ |
| Config Pluginのエラー        | ✅                 | 構文エラー、実行時エラー             |
| app.config.jsの構文          | ✅                 | JSON/JavaScriptの構文                |
| ファイルの存在               | ✅                 | Config Pluginが参照するファイル      |
| ネイティブプロジェクトの生成 | ✅                 | ファイルが生成されるか               |
| **実際のビルドエラー**       | ❌                 | **XcodeビルドまたはEAS Buildが必要** |
| **コンパイルエラー**         | ❌                 | **XcodeビルドまたはEAS Buildが必要** |
| **リンクエラー**             | ❌                 | **XcodeビルドまたはEAS Buildが必要** |

## 🎯 推奨ワークフロー

1. **開発中**: `npx expo prebuild` でConfig Pluginのエラーを確認
2. **コミット前**: Config Pluginで可能な限りビルド設定を修正（今回の修正など）
3. **EAS Build前**: 必要に応じてEAS Buildを実行して実際のビルドエラーを確認

**今回のShareExtensionエラーの場合:**

- ✅ Config Pluginでビルド設定を修正（`CC`、`LD`などを削除）
- ✅ prebuildでConfig Pluginが正常に実行されることを確認
- ⚠️ 実際のビルドエラーはEAS Buildで確認する必要がある
