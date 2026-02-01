# iOS Share Extension 実装状況

最終更新: 2026-02-02

## 📊 現在の状況

### ✅ 完了した項目（MVP達成）

#### 0. アーキテクチャ変更: Supabase経由方式を採用

**実装方針の変更**:

- ❌ App Groupディレクトリアクセス方式（実装困難）
- ✅ Supabase API直接呼び出し方式（MVP完了）

**メリット**:

- Expo Managed Workflow完全対応
- ネイティブモジュール不要
- EAS Buildで問題なく動作
- マルチデバイス対応が容易

**実装内容**:

- ShareExtensionからKeychain経由でSupabaseトークン取得
- Supabase RPC `create_link_with_status` を直接呼び出し
- メインアプリは既存のTanStack Queryで自動同期

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

#### 2. ShareExtension実装（Supabase経由）

- **ネイティブコード**
  - `targets/share-extension/ShareViewController.swift`: Supabase API呼び出し実装
  - `targets/share-extension/Info.plist`: Supabase設定（URL, Anon Key）
  - `targets/share-extension/ShareExtension.entitlements`: Keychain共有設定

- **機能実装**
  - SafariなどからのURL共有を受け取り
  - **Keychain共有でSupabaseセッショントークン取得**
  - **Supabase RPC経由でリンクを直接保存**
  - 保存完了のフィードバックUI表示
  - エラーハンドリング（認証エラー、ネットワークエラー）

- **ShareSheet表示**
  - ✅ **Safari等のShareSheetに表示される**
  - ✅ **URLを受け取ってSupabaseに保存する処理が動作**
  - ✅ **認証なし状態での適切なエラーメッセージ表示**

#### 3. Keychain共有設定

- **Keychain Access Group**
  - メインアプリとShareExtensionで同じKeychainアクセスグループを共有
  - `$(AppIdentifierPrefix)com.sooom.linkcache.dev`（開発環境）
  - `$(AppIdentifierPrefix)com.sooom.linkcache`（本番環境）

- **entitlements設定箇所**
  1. `app.config.js` → `ios.entitlements`（メインアプリ - Expo SecureStoreが自動設定）
  2. `ShareExtension.entitlements` → `keychain-access-groups`（ShareExtension）

- **App Groups設定**
  - 現在は使用していない（将来的にファイル共有が必要な場合に備えて保持）

#### 4. React Native側実装

- **useSharedLinkSync Hook**（TDDで実装）
  - `src/features/share-extension/hooks/useSharedLinkSync.ts`
  - AppStateが`active`になったときにリンク一覧を再取得
  - 認証済みユーザーのみ動作
  - テストカバレッジ100%

- **AppProviders統合**
  - `src/shared/providers/AppProviders.tsx`でフック呼び出し
  - アプリ起動時・フォアグラウンド復帰時に自動同期

- **Config Plugin**
  - `plugins/withShareExtension.ts`でInfo.plistにSupabase設定を注入
  - 環境変数から自動取得（dev/production自動切り替え）

---

## ⚠️ 今後の改善項目

### Phase 2: UX改善

1. **OGPメタデータ取得**
   - 現在はURLのみ保存
   - ShareExtension側でOGPを取得してタイトル・画像も保存

2. **オフライン対応**
   - ネットワークエラー時の再試行機能
   - キューイング機能

3. **複数URL一括処理**
   - 複数のURLを連続で共有した場合の最適化

### Phase 3: エラーハンドリング強化

1. **詳細なエラーメッセージ**
   - ネットワークエラー
   - 認証エラー
   - API制限エラー

2. **ユーザーフィードバック**
   - より詳細な成功/失敗メッセージ
   - 保存されたリンクへのディープリンク

---

## 📋 実装済み機能

### ✅ MVP達成（Supabase経由方式）

**実装完了項目**:

1. ✅ ShareExtensionからSupabase APIへの直接POST
2. ✅ Keychain共有によるセッショントークン取得
3. ✅ メインアプリでのリンク自動同期（useSharedLinkSync）
4. ✅ 認証エラー時の適切なフィードバック
5. ✅ EAS Build対応
6. ✅ TDDによるテストカバレッジ

**技術的実装**:

- Swift側: Keychain API + URLSession
- React Native側: AppState監視 + TanStack Query invalidation
- Config Plugin: 環境変数からSupabase設定を注入

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

### 実装済み設計（Supabase経由）

```
Safari/他アプリ
    ↓ (Share Sheet)
ShareExtension (ShareViewController.swift)
    ↓ (1) Keychain共有でトークン取得
Keychain (iOS Secure Storage)
    ↓ (2) Supabaseセッショントークン
ShareExtension
    ↓ (3) HTTP POST (create_link_with_status RPC)
Supabase API
    ↓ (4) データベース保存
メインアプリ (React Native)
    ↓ (5) AppState: active
useSharedLinkSync フック
    ↓ (6) TanStack Query invalidation
リンク一覧の自動再取得
```

### データフロー

1. **Share Extension側** (完了)

   ```
   URL受信
     → Keychainからトークン取得
     → Supabase RPC呼び出し
     → 成功/失敗UI表示
     → 終了
   ```

2. **メインアプリ側** (完了)
   ```
   アプリ起動/復帰
     → AppState: active検知
     → ユーザー認証確認
     → リンク一覧を無効化
     → TanStack Queryが自動再取得
     → 新規リンクが表示される
   ```

---

## 📁 関連ファイル一覧

### Config & Build設定

- `/app.config.js` - Expo設定（Supabase設定、ShareExtension宣言）
- `/eas.json` - EASビルド設定
- `/plugins/withShareExtension.ts` - ShareExtensionターゲット追加、Supabase設定注入
- `/plugins/withAppGroups.ts` - App Groups capability（将来用に保持）

### ShareExtension（ネイティブ）

- `/targets/share-extension/ShareViewController.swift` - Supabase API呼び出し実装
- `/targets/share-extension/Info.plist` - 拡張情報（Supabase URL/Key含む）
- `/targets/share-extension/ShareExtension.entitlements` - Keychain共有設定

### React Native機能実装

- `/src/features/share-extension/`
  - `index.ts` - エクスポート
  - `hooks/useSharedLinkSync.ts` - **AppState監視とリンク同期（実装済み）**
  - `utils/sharedItem.ts` - データバリデーション（型定義用）
  - `types/sharedItem.types.ts` - 型定義
  - `constants/appGroup.ts` - 定数

### 統合ポイント

- `/src/shared/providers/AppProviders.tsx` - **SharedLinkProcessor（実装済み）**

### テスト

- `/src/features/share-extension/__tests__/hooks/useSharedLinkSync.test.tsx` - **TDDで実装（100%カバレッジ）**
- `/src/features/share-extension/__tests__/utils/sharedItem.test.ts` - 型バリデーションテスト

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
   - dev/production環境で自動切り替え
   - Bundle Identifier、Keychain Access Group、Supabase設定

3. **Supabase経由方式を採用**
   - App Groupディレクトリアクセスは実装困難と判断
   - Keychain共有 + Supabase API直接呼び出しで実現
   - Expo Managed Workflow完全対応

4. **TDDアプローチ**
   - React Native側の実装はテストファーストで実施
   - モックは最小限（古典的TDD）
   - 100%テストカバレッジ達成

### 解決済みの問題

1. ~~**App Groupディレクトリアクセス**~~
   - ✅ Supabase経由方式に変更して解決
   - ネイティブモジュール不要

2. ~~**Metro bundlerエラー**~~
   - ✅ `react-native-app-group-directory`依存を完全削除
   - ビルドエラー解消

3. ~~**メインアプリでの受信処理**~~
   - ✅ `useSharedLinkSync`フックで実装
   - AppState監視による自動同期

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

### MVP（Minimum Viable Product）✅ 達成

- [x] ShareSheetに表示される
- [x] URLを受け取れる
- [x] **メインアプリでURLを受信できる（Supabase経由）**
- [x] **受信したURLがリンクリストに自動追加される**
- [x] **EAS Buildで動作する**
- [x] **認証エラー時の適切なフィードバック**

### Full Release（今後の改善）

- [ ] OGPメタデータ自動取得
- [ ] オフライン対応（キューイング）
- [ ] エラーハンドリング強化
- [ ] 複数URL一括処理最適化
- [ ] UX最適化（ディープリンク等）
- [ ] Production環境デプロイ

---

最終更新: 2026-02-02  
実装状況: **MVP完了（Supabase経由方式）**  
次回レビュー予定: Production環境テスト後
