# ExpoプロジェクトでのNativeコード実装ガイド

最終更新: 2026-02-03

## 概要

このドキュメントは、Expo SDK 54（Managed Workflow）でNativeコードを含む実装を行う際の一般的な手順と注意点を整理したものです。iOS App Extension（Share Extensionなど）やカスタムネイティブモジュールの実装を想定しています。

## 🎯 基本原則

### 1. Expo Managed Workflowの維持
- **Bare Workflowへの移行は避ける**: Config Pluginを使用してManaged Workflowを維持
- **ネイティブプロジェクトファイルの直接編集を避ける**: `ios/`や`android/`ディレクトリは自動生成されるため、直接編集しない
- **Config Pluginによる自動化**: すべてのネイティブ設定変更はConfig Pluginで実装

### 2. 段階的な実装アプローチ
- **小さなステップで検証**: 各ステップで動作確認を行い、問題を早期発見
- **Prebuildでの検証**: 実際のビルド前に`npx expo prebuild`でConfig Pluginのエラーを確認
- **EAS Buildでの最終検証**: Prebuildでは検出できないビルドエラーはEAS Buildで確認

---

## 📋 実装手順

### Phase 1: 計画・設計

#### 1.1 要件の明確化
- **実装する機能の特定**: App Extension、カスタムネイティブモジュール、Entitlementsなど
- **必要なCapabilitiesの確認**: App Groups、Keychain Sharing、Push Notificationsなど
- **環境変数の整理**: dev/production環境での設定値の違いを明確化

#### 1.2 アーキテクチャの決定
- **データ共有方法の選択**: App Groups、Keychain Sharing、Supabase APIなど
- **ネイティブコードの範囲**: 純粋なSwift/Objective-Cコードか、React Nativeブリッジが必要か
- **依存関係の確認**: 外部ライブラリの使用可否、Expo SDKとの互換性

#### 1.3 ファイル構造の設計
- **ネイティブコードの配置場所**: `targets/`ディレクトリなど、プロジェクトルートに配置
- **Config Pluginの配置**: `plugins/`ディレクトリに配置
- **設定ファイルの管理**: Info.plist、Entitlements、Podfileなど

---

### Phase 2: Config Pluginの実装

#### 2.1 Config Pluginの基本構造
- **プラグインの型定義**: TypeScriptでオプションの型を定義
- **プラグインのエクスポート**: `ConfigPlugin`型を使用して実装
- **エラーハンドリング**: ファイルの存在確認、設定値の検証

#### 2.2 Xcodeプロジェクトの操作
- **ターゲットの追加**: `withXcodeProject`を使用してターゲットを追加
- **ビルドフェーズの設定**: Sources、Resources、Frameworksフェーズの追加
- **ファイルの追加**: ソースファイル、リソースファイル、設定ファイルの追加

#### 2.3 ビルド設定の調整
- **React Nativeとの競合回避**: 
  - App Extensionなど、React Nativeのビルドツールが不要なターゲットでは、React Nativeのビルドスクリプト参照を削除
  - `CC`、`CXX`、`LD`などを標準コンパイラ（`clang`、`clang++`）に明示的に設定
  - `CLANG_ENABLE_EXPLICIT_MODULES`を`NO`に設定（警告回避）
- **必須設定の追加**: 
  - `PRODUCT_BUNDLE_IDENTIFIER`
  - `INFOPLIST_FILE`
  - `CODE_SIGN_ENTITLEMENTS`
  - `IPHONEOS_DEPLOYMENT_TARGET`

#### 2.4 Entitlementsの設定
- **メインアプリのEntitlements**: `withEntitlementsPlist`を使用
- **ExtensionのEntitlements**: `withDangerousMod`でファイルを直接操作
- **App Groupsの設定**: メインアプリとExtensionで同じApp Group IDを設定
- **Keychain Sharingの設定**: Keychain Access Groupを設定

#### 2.5 Podfileの修正
- **post_installフックの追加**: `withDangerousMod`でPodfileを修正
- **ビルド設定の統一**: Extensionターゲットのビルド設定をPodfileでも設定
- **注意**: Podfileのパターンマッチングは慎重に行う（既存の設定を壊さない）

#### 2.6 ファイルのコピー
- **ソースファイルのコピー**: `withDangerousMod`でネイティブコードをコピー
- **設定値の注入**: 環境変数や動的な設定値をファイルに注入
- **エラーハンドリング**: ソースファイルの存在確認

---

### Phase 3: ネイティブコードの実装

#### 3.1 ネイティブコードの作成
- **Swift/Objective-Cコード**: プロジェクトルートの`targets/`ディレクトリなどに配置
- **環境変数の参照**: Info.plistに設定値を追加し、コードから参照
- **エラーハンドリング**: 適切なエラーメッセージとログ出力

#### 3.2 Info.plistの設定
- **Extension固有の設定**: `NSExtension`キーでExtensionの種類を設定
- **環境変数の追加**: Supabase URL、API Keyなど、Config Pluginで注入
- **権限の設定**: 必要な権限（ネットワークアクセスなど）を追加

#### 3.3 Entitlementsファイルの作成
- **App Groups**: Extensionとメインアプリで共有するApp Group ID
- **Keychain Sharing**: Keychain Access Groupの設定
- **その他のCapabilities**: 必要なCapabilitiesを追加

---

### Phase 4: app.config.jsの設定

#### 4.1 プラグインの登録
- **プラグインの追加**: `plugins`配列にConfig Pluginを追加
- **オプションの設定**: 環境変数や動的な設定値を渡す
- **プラグインの順序**: Entitlements設定など、依存関係を考慮した順序

#### 4.2 EAS Build設定
- **App Extensionsの宣言**: `extra.eas.build.experimental.ios.appExtensions`でExtensionを宣言
- **Bundle Identifier**: ExtensionのBundle Identifierを設定
- **Entitlements**: ExtensionのEntitlementsを設定

#### 4.3 環境変数の管理
- **環境ごとの設定**: dev/production環境で異なる設定値を管理
- **EAS Secrets**: 機密情報はEAS Secretsで管理
- **環境変数の注入**: Config Pluginで環境変数をネイティブコードに注入

---

### Phase 5: ビルド設定の調整

#### 5.1 React Nativeとの競合回避
- **ビルドツールの分離**: App Extensionなど、React Nativeのビルドツールが不要なターゲットでは、標準コンパイラを使用
- **ビルドスクリプトの削除**: `CC`、`CXX`、`LD`などのReact Nativeスクリプト参照を削除
- **モジュールシステムの無効化**: `CLANG_ENABLE_EXPLICIT_MODULES`を`NO`に設定

#### 5.2 コンパイラ設定
- **標準コンパイラの明示**: `clang`、`clang++`を明示的に設定
- **リンカーの設定**: `LD`、`LDPLUSPLUS`を標準リンカーに設定
- **警告の回避**: 不要な警告を抑制する設定を追加

#### 5.3 依存関係の管理
- **CocoaPodsの設定**: PodfileでExtensionターゲットの依存関係を管理
- **フレームワークのリンク**: 必要なフレームワークをリンク
- **ライブラリの除外**: React Nativeライブラリなど、不要なライブラリを除外

---

### Phase 6: テスト・検証

#### 6.1 Prebuildでの検証
- **Config Pluginのエラー確認**: `npx expo prebuild`でConfig Pluginのエラーを確認
- **ファイル生成の確認**: `ios/`ディレクトリが正しく生成されるか確認
- **設定値の検証**: 生成されたプロジェクトファイルの設定値を確認

#### 6.2 ローカルビルド（オプション）
- **Xcodeでのビルド**: Xcodeが利用可能な場合、ローカルでビルドしてエラーを確認
- **シミュレーターでの実行**: シミュレーターで動作確認
- **デバッグ**: ビルドエラーやランタイムエラーをデバッグ

#### 6.3 EAS Buildでの検証
- **開発ビルド**: `eas build --platform ios --profile development`で開発ビルドを実行
- **ビルドログの確認**: ビルドエラーや警告を確認
- **実機でのテスト**: TestFlightや内部配布で実機テスト

---

### Phase 7: EAS Build設定の最適化

#### 7.1 eas.jsonの設定
- **ビルドプロファイル**: dev/production環境ごとのプロファイル設定
- **リソースクラス**: ビルド時間とコストのバランスを考慮
- **環境変数**: ビルド時に必要な環境変数を設定

#### 7.2 認証情報の管理
- **Apple Developer Portal**: Provisioning ProfileとCertificateの設定
- **EAS Credentials**: EASで認証情報を管理
- **App Groups**: App Groups capabilityを含むProvisioning Profileを作成

#### 7.3 ビルド最適化
- **キャッシュの活用**: EAS Buildのキャッシュ機能を活用
- **ビルド時間の短縮**: 不要な依存関係の削除、ビルド設定の最適化

---

## ⚠️ 重要な注意点

### 1. PrebuildとEAS Buildの違い

#### Prebuildで確認できること
- ✅ Config Pluginの実行エラー
- ✅ app.config.jsの構文エラー
- ✅ ファイルの存在確認
- ✅ ネイティブプロジェクトファイルの生成

#### Prebuildで確認できないこと
- ❌ 実際のビルドエラー（コンパイルエラー、リンクエラー）
- ❌ コード署名のエラー
- ❌ 実行時エラー

**対策**: PrebuildでConfig Pluginのエラーを確認した後、EAS Buildで実際のビルドエラーを確認する

---

### 2. React Nativeとの競合回避

#### 問題点
- App Extensionなど、React Nativeのビルドツールが不要なターゲットに、React Nativeのビルドスクリプト参照が設定される
- `react-native/scripts/xcode/ccache-clang.sh`へのパスが壊れる
- ビルドエラーが発生する

#### 解決策
- Config Pluginでビルド設定を修正
- `CC`、`CXX`、`LD`などを標準コンパイラ（`clang`、`clang++`）に明示的に設定
- React Native関連のビルド設定を削除
- Podfileの`post_install`フックでも同様の設定を追加

---

### 3. 環境変数の管理

#### 注意点
- **機密情報の扱い**: API KeyなどはEAS Secretsで管理
- **環境ごとの設定**: dev/production環境で異なる設定値を管理
- **Config Pluginでの注入**: 環境変数をネイティブコードに注入する際は、Config Pluginで動的に設定

#### ベストプラクティス
- `.env.example`で必要な環境変数を文書化
- `app.config.js`で環境変数のデフォルト値を設定
- Config Pluginで環境変数の存在確認とエラーハンドリング

---

### 4. Entitlementsの設定

#### 注意点
- **メインアプリとExtension**: 両方に同じApp Group IDを設定
- **Keychain Sharing**: Keychain Access Groupを正しく設定
- **Bundle Identifier**: Entitlementsファイルの設定と一致させる

#### ベストプラクティス
- Config PluginでEntitlementsを動的に生成
- 環境変数からApp Group IDやBundle Identifierを取得
- 設定値の整合性を保つ

---

### 5. ファイルパスの扱い

#### 注意点
- **相対パスと絶対パス**: Config Plugin内では`modRequest.projectRoot`や`modRequest.platformProjectRoot`を使用
- **ファイルの存在確認**: コピー前にソースファイルの存在を確認
- **パスの正規化**: プラットフォーム間のパス区切り文字の違いに注意

#### ベストプラクティス
- `path.join()`を使用してパスを構築
- `fs.existsSync()`でファイルの存在を確認
- エラーメッセージにファイルパスを含める

---

### 6. Podfileの修正

#### 注意点
- **既存設定の保持**: Podfileの既存設定を壊さないように注意
- **パターンマッチング**: 正規表現でパターンをマッチさせる際は、既存のコードを壊さないように注意
- **post_installフック**: 他のプラグインやExpoの設定と競合しないように注意

#### ベストプラクティス
- 特定のパターン（例: `react_native_post_install`）の後に追加
- 既存の設定を上書きしない
- コメントで設定の目的を明確化

---

### 7. ビルド設定の優先順位

#### 設定の適用順序
1. **プロジェクトレベルの設定**: Xcodeプロジェクトのデフォルト設定
2. **Config Pluginでの設定**: `withXcodeProject`で設定した値
3. **Podfileでの設定**: `post_install`フックで設定した値

#### 注意点
- 同じ設定が複数の場所で設定される場合、後の設定が優先される
- Config PluginとPodfileの両方で設定することで、確実に設定を適用

---

### 8. エラーハンドリング

#### Config Plugin内でのエラーハンドリング
- **ファイルの存在確認**: ソースファイルが存在するか確認
- **設定値の検証**: 必須の設定値が提供されているか確認
- **明確なエラーメッセージ**: エラー発生時に分かりやすいメッセージを出力

#### ビルドエラーの対処
- **ビルドログの確認**: EAS Buildのログを詳細に確認
- **段階的なデバッグ**: 小さな変更を加えて、問題の原因を特定
- **コミュニティリソース**: Expo公式フォーラムやGitHub Issuesを参照

---

## 🔍 トラブルシューティング

### よくあるエラーと対処法

#### 1. "unable to spawn process '/../../node_modules/react-native/scripts/xcode/ccache-clang.sh'"
**原因**: React Nativeのビルドスクリプト参照がApp Extensionに設定されている

**対処法**:
- Config Pluginで`CC`、`CXX`、`LD`を標準コンパイラに設定
- Podfileの`post_install`フックでも同様の設定を追加

#### 2. "No such module 'XXX'"
**原因**: モジュールが見つからない、またはビルド設定の問題

**対処法**:
- `CLANG_ENABLE_EXPLICIT_MODULES`を`NO`に設定
- 必要なフレームワークがリンクされているか確認

#### 3. "Code signing error"
**原因**: Provisioning ProfileやCertificateの設定が正しくない

**対処法**:
- Apple Developer PortalでApp Groups capabilityを含むProvisioning Profileを作成
- EAS Credentialsで認証情報を確認

#### 4. "App Group not found"
**原因**: App Group IDが正しく設定されていない

**対処法**:
- メインアプリとExtensionの両方に同じApp Group IDを設定
- Apple Developer PortalでApp Groupが作成されているか確認

---

## 📚 参考リソース

### Expo公式ドキュメント
- [iOS App Extensions](https://docs.expo.dev/build-reference/app-extensions/)
- [Config Plugins](https://docs.expo.dev/config-plugins/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

### Apple公式ドキュメント
- [App Extensions](https://developer.apple.com/app-extensions/)
- [Share Extension](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/Share.html)
- [App Groups](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups)

### コミュニティリソース
- Expo公式フォーラム
- GitHub Issues（expo/expo、react-native/react-native）

---

## 🎯 チェックリスト

### 実装前
- [ ] 要件とアーキテクチャが明確化されている
- [ ] 必要なCapabilitiesが特定されている
- [ ] 環境変数の管理方法が決定されている

### Config Plugin実装
- [ ] Config Pluginの基本構造が実装されている
- [ ] Xcodeプロジェクトへのターゲット追加が実装されている
- [ ] ビルド設定の調整が実装されている（React Nativeとの競合回避）
- [ ] Entitlementsの設定が実装されている
- [ ] Podfileの修正が実装されている
- [ ] ファイルのコピーと設定値の注入が実装されている
- [ ] エラーハンドリングが実装されている

### ネイティブコード実装
- [ ] ネイティブコードが実装されている
- [ ] Info.plistが設定されている
- [ ] Entitlementsファイルが設定されている

### app.config.js設定
- [ ] Config Pluginが登録されている
- [ ] EAS Build設定が追加されている
- [ ] 環境変数が適切に管理されている

### テスト・検証
- [ ] PrebuildでConfig Pluginのエラーがないことを確認
- [ ] EAS Buildでビルドが成功することを確認
- [ ] 実機で動作確認

---

## 📝 まとめ

Expo Managed WorkflowでNativeコードを含む実装を行う際は、以下のポイントを重視してください：

1. **Config Pluginによる自動化**: すべてのネイティブ設定変更はConfig Pluginで実装
2. **React Nativeとの競合回避**: App Extensionなどでは、React Nativeのビルドツール参照を削除
3. **段階的な検証**: PrebuildでConfig Pluginのエラーを確認し、EAS Buildで実際のビルドエラーを確認
4. **環境変数の適切な管理**: dev/production環境での設定値の違いを考慮
5. **エラーハンドリング**: 明確なエラーメッセージと適切な検証

これらの原則に従うことで、Expo Managed Workflowを維持しながら、Nativeコードを含む機能を実装できます。

---

最終更新: 2026-02-03  
Expo SDK: 54  
実装例: iOS Share Extension
