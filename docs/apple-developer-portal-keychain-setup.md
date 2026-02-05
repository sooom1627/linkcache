# Apple Developer Portal - Keychain Sharing設定手順

## 概要

メインアプリとShare Extension間でKeychainを共有するために、Apple Developer PortalでKeychain Sharing capabilityを有効化する必要があります。

## 参考リンク

- [Enable app capabilities - Apple Developer Documentation](https://developer.apple.com/help/account/manage-identifiers/enable-app-capabilities/)
- [Provisioning with capabilities - Apple Developer Documentation](https://developer.apple.com/help/account/reference/provisioning-with-managed-capabilities/)
- [Sharing access to keychain items - Apple Developer Documentation](https://developer.apple.com/documentation/security/sharing-access-to-keychain-items-among-a-collection-of-apps)
- [Using automatically managed credentials - Expo Documentation](https://docs.expo.dev/app-signing/managed-credentials/)

## 設定手順

### 1. メインアプリのApp ID設定

1. [Apple Developer Portal](https://developer.apple.com/account/)にログイン
2. **Certificates, Identifiers & Profiles** → **Identifiers** に移動
3. メインアプリのApp IDを選択：
   - 開発環境: `com.sooom.linkcache.dev`
   - 本番環境: `com.sooom.linkcache`
4. **Capabilities**タブで以下を確認・有効化：
   - ✅ **App Groups** - 有効（既に設定済み）
   - ✅ **Keychain Sharing** - **有効化が必要な場合は有効化**
5. **Save**をクリック

**注意**: EAS Buildを使用している場合、EASが自動的にProvisioning Profileを管理しますが、App IDのCapabilitiesは手動で有効化する必要があります。

### 2. Share ExtensionのApp ID設定

1. Share ExtensionのApp IDを選択：
   - 開発環境: `com.sooom.linkcache.dev.ShareExtension`
   - 本番環境: `com.sooom.linkcache.ShareExtension`
2. **Capabilities**タブで以下を確認・有効化：
   - ✅ **App Groups** - 有効（既に設定済み）
   - ✅ **Keychain Sharing** - **有効化が必要な場合は有効化**
3. **Save**をクリック

### 3. Provisioning Profileの確認

EAS Buildを使用している場合、次回のビルド時に自動的にProvisioning Profileが更新されます。

**確認方法**:

```bash
# EAS Buildで新しいProvisioning Profileを生成（必要に応じて）
eas build --platform ios --profile dev --clear-cache
```

## 設定後の確認事項

### entitlementsファイルの確認

prebuild後のentitlementsファイルで`keychain-access-groups`の値が一致していることを確認：

```bash
npx expo prebuild --clean --platform ios
cat ios/linkcachedev/linkcachedev.entitlements | grep -A 3 "keychain-access-groups"
cat ios/ShareExtension/ShareExtension.entitlements | grep -A 3 "keychain-access-groups"
```

両方のentitlementsファイルで以下の値が一致していることを確認：

- 開発環境: `$(AppIdentifierPrefix)com.sooom.linkcache.dev`
- 本番環境: `$(AppIdentifierPrefix)com.sooom.linkcache`

### ビルドとテスト

1. EAS Buildでビルド実行
2. デバイスにインストール
3. メインアプリでログイン
4. Share ExtensionからURL共有を試行
5. Keychainからトークンが取得できるか確認

## トラブルシューティング

### Keychain Access Groupが一致しない場合

- `app.config.js`の`ios.entitlements`で`keychain-access-groups`が正しく設定されているか確認
- Share Extensionの`ShareExtension.entitlements`で`keychain-access-groups`が正しく設定されているか確認
- prebuild後のentitlementsファイルで実際の値が一致しているか確認

### Provisioning Profileが更新されない場合

- Apple Developer PortalでApp IDのCapabilitiesが正しく有効化されているか確認
- EAS Buildのキャッシュをクリアして再ビルド: `eas build --platform ios --profile dev --clear-cache`

### Keychainからトークンが取得できない場合

- Share Extensionのデバッグログを確認（XcodeのConsoleで確認可能）
- メインアプリでログイン後、Keychainにトークンが保存されているか確認
- Keychain Access Groupの値が一致しているか確認
