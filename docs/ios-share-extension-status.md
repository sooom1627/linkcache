# iOS Share Extension 実装状況

最終更新: 2026-02-01

## 📊 現在の状況

### ✅ 完了した項目

#### 1. EAS Build設定
- **Config Plugin実装**
  - `plugins/withShareExtension.ts`: ShareExtensionターゲットをXcodeプロジェクトに追加
  - `plugins/withAppGroups.ts`: App Groups capability追加（現在は未使用）
  
- **app.config.js設定**
  - `tsx`ライブラリ導入（TypeScript config pluginサポート）
  - `extra.eas.build.experimental.ios.appExtensions`でShareExtension宣言
  - メインアプリ・ShareExtension両方にApp Groups entitlements設定
  - 環境変数対応（dev/production自動切り替え）

- **認証情報管理**
  - Apple Developer Portalへのログイン設定
  - メインアプリ用Provisioning Profile（App Groups capability付き）
  - ShareExtension用Provisioning Profile（App Groups capability付き）
  - Distribution Certificate共有設定

#### 2. ShareExtension実装
- **ネイティブコード**
  - `targets/share-extension/ShareViewController.swift`: UI実装完了
  - `targets/share-extension/Info.plist`: 拡張設定
  - `targets/share-extension/ShareExtension.entitlements`: App Groups設定

- **機能実装**
  - SafariなどからのURL共有を受け取り
  - App Groupディレクトリに共有データを保存（JSON形式）
  - 保存完了のフィードバックUI表示
  - エラーハンドリング

- **ShareSheet表示**
  - ✅ **Safari等のShareSheetに表示されることを確認済み**
  - ✅ **URLを受け取って保存する処理が動作**

#### 3. App Groups設定
- **App Group ID**
  - Dev環境: `group.com.sooom.linkcache.dev`
  - Production環境: `group.com.sooom.linkcache`

- **entitlements設定箇所**
  1. `app.config.js` → `ios.entitlements`（メインアプリ）
  2. `app.config.js` → `appExtensions[0].entitlements`（ShareExtension）
  3. `withShareExtension.ts`で物理ファイル生成時に動的設定

---

## ⚠️ 未完了項目（一時的に無効化中）

### メインアプリ側のShare Extension連携機能

#### 1. App Groupディレクトリアクセス
**場所**: `src/features/share-extension/utils/appGroupReader.ts`

**問題点**:
- `react-native-app-group-directory`パッケージに依存
- このパッケージは実在せず、Expo Managed Workflowでも動作しない
- Metro bundlerでビルドエラーが発生していた

**現状**:
- `src/shared/providers/AppProviders.tsx`で`usePendingSharedLinks`の呼び出しをコメントアウト
- ビルドは通るが、共有されたURLをメインアプリで受け取れない

#### 2. 依存ファイル
以下のファイルが実装済みだが未使用：
- `src/features/share-extension/utils/appGroupReader.ts`
- `src/features/share-extension/utils/sharedItem.ts`
- `src/features/share-extension/hooks/usePendingSharedLinks.ts`
- `src/features/share-extension/hooks/useProcessSharedLink.ts`
- `src/features/share-extension/types/sharedItem.types.ts`
- `src/features/share-extension/constants/appGroup.ts`

---

## 📋 次のTODO

### Phase 1: App Groupディレクトリアクセス実装

#### Option A: Expo Modules（推奨）
**概要**: カスタムExpo Moduleを作成してネイティブコードからApp Groupディレクトリパスを取得

**必要な作業**:
1. Expo Moduleの作成
   - `expo-modules-core`を使用
   - iOSネイティブコード（Swift）でApp Groupディレクトリパスを取得
   - React Nativeに公開するAPIを定義

2. JavaScript側の統合
   - `appGroupReader.ts`を新しいModuleを使用するように修正
   - `expo-file-system`でファイル読み書き（既存実装）

**メリット**:
- Expo Managed Workflowと完全互換
- EAS Buildで問題なくビルド可能
- 公式な方法で推奨される

**デメリット**:
- ネイティブコード（Swift/Objective-C）の知識が必要
- 初期実装に時間がかかる

#### Option B: Deep Linking（代替案）
**概要**: Share ExtensionからメインアプリにURLを直接渡す

**必要な作業**:
1. ShareViewController.swiftの修正
   - App Groupに保存せず、Custom URL Schemeでメインアプリを起動
   - `linkcache://share?url=...`形式で渡す

2. メインアプリでDeep Link受信
   - `expo-linking`で受信
   - 認証状態を確認してリンク保存処理

**メリット**:
- ネイティブモジュール不要
- 実装が比較的簡単

**デメリット**:
- メインアプリが起動していない場合、URLが失われる可能性
- バックグラウンドでの処理ができない
- 複数URLの一括処理が困難

#### Option C: Supabase経由（代替案）
**概要**: ShareExtensionから直接Supabaseにデータを送信

**必要な作業**:
1. ShareViewController.swiftの修正
   - Supabase API呼び出し（Swift）
   - 認証トークン管理

2. メインアプリでデータ同期
   - 既存のTanStack Queryで自動取得

**メリット**:
- App Groupディレクトリ不要
- マルチデバイス対応が容易

**デメリット**:
- オフライン時に動作しない
- ShareExtensionで認証処理が必要
- ネットワーク通信のオーバーヘッド

---

### Phase 2: 統合テスト

1. **Share Extension → メインアプリのフロー確認**
   - Safari等からURL共有
   - メインアプリでデータ受信確認
   - リンク保存処理の動作確認

2. **エラーハンドリング**
   - 認証なし状態での動作
   - ネットワークエラー時の動作
   - 無効なURL受信時の動作

3. **複数URL処理**
   - 連続共有の動作確認
   - App起動前に複数共有した場合の処理

---

### Phase 3: UX改善

1. **ShareExtension UI改善**
   - アプリアイコン表示
   - より詳細なフィードバック
   - エラー時の再試行オプション

2. **メインアプリ側の通知**
   - 共有されたリンクの通知表示
   - バッジカウント更新

---

## 🏗️ アーキテクチャ概要

### 現在の設計

```
Safari/他アプリ
    ↓ (Share Sheet)
ShareExtension (ShareViewController.swift)
    ↓ (App Group経由で保存)
App Group Directory
    📁 SharedItems/
        📄 {uuid}.json
    ↓ (読み取り - 未実装)
メインアプリ (React Native)
    ↓
usePendingSharedLinks フック
    ↓
リンク保存処理
```

### データフロー

1. **Share Extension側** (完了)
   ```
   URL受信 → 検証 → JSON生成 → App Groupに保存 → UI表示
   ```

2. **メインアプリ側** (未完了)
   ```
   アプリ起動 → App Group読取 → JSON解析 → リンク保存 → ファイル削除
   ```

---

## 📁 関連ファイル一覧

### Config & Build設定
- `/app.config.js` - Expo設定（App Groups, ShareExtension宣言）
- `/eas.json` - EASビルド設定
- `/plugins/withShareExtension.ts` - ShareExtensionターゲット追加
- `/plugins/withAppGroups.ts` - App Groups capability（未使用）

### ShareExtension（ネイティブ）
- `/targets/share-extension/ShareViewController.swift` - メインロジック
- `/targets/share-extension/Info.plist` - 拡張情報
- `/targets/share-extension/ShareExtension.entitlements` - 権限設定

### React Native機能実装
- `/src/features/share-extension/`
  - `index.ts` - エクスポート
  - `hooks/usePendingSharedLinks.ts` - 共有リンク監視（未使用）
  - `hooks/useProcessSharedLink.ts` - リンク処理（未使用）
  - `utils/appGroupReader.ts` - App Group読取（問題あり）
  - `utils/sharedItem.ts` - データパース
  - `types/sharedItem.types.ts` - 型定義
  - `constants/appGroup.ts` - 定数

### 統合ポイント
- `/src/shared/providers/AppProviders.tsx` - SharedLinkProcessor（一時無効化）

### テスト
- `/src/features/share-extension/__tests__/` - ユニットテスト群
- `/src/features/share-extension/__mocks__/` - モック

---

## 🎯 優先順位

### High Priority（必須）
1. ✅ **EAS Buildの成功** - 完了
2. ✅ **ShareSheetへの表示** - 完了
3. 🔄 **App Groupディレクトリアクセス実装** - 次のステップ
4. 🔄 **メインアプリでの受信・保存処理** - 次のステップ

### Medium Priority（重要）
- エラーハンドリングの強化
- オフライン対応
- 複数URL処理の最適化

### Low Priority（改善）
- UI/UXの洗練
- パフォーマンス最適化
- アナリティクス追加

---

## 📝 メモ・備考

### 技術的決定事項

1. **Expo Managed Workflowを維持**
   - Bare workflowへの移行はしない
   - すべてConfig Pluginで実装

2. **環境変数対応**
   - dev/production環境でApp Group ID自動切り替え
   - Bundle Identifier自動切り替え

3. **Share Extension一時無効化の理由**
   - `react-native-app-group-directory`パッケージが存在しない
   - Metro bundlerエラーを回避してビルドを通すため
   - ShareExtension自体は動作している

### 既知の問題

1. **App Groupディレクトリアクセス**
   - Expo Managed Workflowで動作するネイティブモジュールが必要
   - 現状、既製のnpmパッケージが存在しない

2. **型定義ファイル**
   - `/types/react-native-app-group-directory.d.ts`は実装されているが、実体がない
   - モックファイルもあるがテスト専用

---

## 🔗 参考リソース

### Expo公式ドキュメント
- [iOS App Extensions](https://docs.expo.dev/build-reference/app-extensions/)
- [Config Plugins](https://docs.expo.dev/config-plugins/introduction/)
- [Expo Modules](https://docs.expo.dev/modules/overview/)

### Apple公式ドキュメント
- [App Extensions](https://developer.apple.com/app-extensions/)
- [Share Extension](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/Share.html)
- [App Groups](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups)

### コミュニティリソース
- [expo-config-plugin-ios-share-extension](https://github.com/timedtext/expo-config-plugin-ios-share-extension)
- [react-native-shared-group-preferences](https://www.npmjs.com/package/react-native-shared-group-preferences) - Expo非対応

---

## ✅ 成功基準

### MVP（Minimum Viable Product）
- [x] ShareSheetに表示される
- [x] URLを受け取れる
- [ ] メインアプリでURLを受信できる
- [ ] 受信したURLがリンクリストに追加される

### Full Release
- [ ] オフライン対応
- [ ] エラーハンドリング完備
- [ ] 複数URL一括処理
- [ ] UX最適化
- [ ] Production環境デプロイ

---

最終更新: 2026-02-01
次回レビュー予定: App Groupディレクトリアクセス実装完了後
