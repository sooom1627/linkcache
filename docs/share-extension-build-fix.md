# ShareExtensionビルドエラー修正

## 問題

EAS Buildで以下のエラーが発生していました：

```
unable to spawn process '/../../node_modules/react-native/scripts/xcode/ccache-clang.sh' (No such file or directory)
(in target 'ShareExtension' from project 'linkcachedev')
```

## 原因

ShareExtensionターゲットのXcodeビルド設定が、React Nativeのビルドスクリプト（`ccache-clang.sh`等）を参照していました。しかし、Expoプロジェクトではこれらのスクリプトのパスが存在しないため、ビルドエラーが発生していました。

ShareExtensionはネイティブターゲットなので、標準のXcodeビルドツールを使用する必要があります。

## 解決策

### 1. Config Pluginの修正

`plugins/withShareExtension.ts`で、ShareExtensionターゲットのビルド設定からReact Nativeスクリプトへの参照を削除するように修正しました：

```typescript
// React Nativeのビルドスクリプト参照を削除
// ShareExtensionは標準のXcodeビルドツールを使用する必要がある
// Expoプロジェクトではreact-native/scripts/xcode/ccache-clang.shが存在しないため
delete buildSettings["CC"];
delete buildSettings["LD"];
delete buildSettings["CXX"];
delete buildSettings["LDPLUSPLUS"];
delete buildSettings["SWIFT"];
delete buildSettings["LIBTOOL"];
delete buildSettings["AR"];
delete buildSettings["RANLIB"];
delete buildSettings["STRIP"];
delete buildSettings["NM"];
delete buildSettings["OBJCOPY"];
delete buildSettings["OBJDUMP"];
delete buildSettings["READELF"];
```

これにより、ShareExtensionターゲットは標準のXcodeビルドツールを使用するようになります。

## 検証方法

### Prebuildでの確認

`npx expo prebuild` を実行すると、Config Pluginが正常に実行されることを確認できます：

```bash
npx expo prebuild --clean
```

**確認できること:**

- ✅ Config Pluginが正常に実行される
- ✅ ShareExtensionターゲットが追加される
- ✅ ビルド設定が正しく設定される

**確認できないこと:**

- ❌ 実際のビルドエラー（コンパイルエラー、リンクエラーなど）

詳細は [`docs/prebuild-validation-limitations.md`](./prebuild-validation-limitations.md) を参照してください。

### EAS Buildでの検証

実際のビルドエラーを確認するには、EAS Buildを実行する必要があります：

```bash
eas build --platform ios --profile dev
```

**確認できること:**

- ✅ 実際のビルドエラー（コンパイルエラー、リンクエラーなど）
- ✅ コード署名のエラー
- ✅ すべてのビルド関連の問題

## 今後の注意事項

- ShareExtensionなどのApp Extensionターゲットを追加する際は、React Nativeのビルドスクリプトを参照しないように注意する
- 新しいビルド設定を追加する際は、標準のXcodeツールを使用する
- Config Pluginで可能な限りビルド設定を修正して、ビルドエラーを防ぐ
- 実際のビルドエラーはEAS Buildで確認する必要がある（prebuildでは検出できない）

## 参考

- [Expo iOS App Extensions](https://docs.expo.dev/build-reference/app-extensions/)
- [Xcode Build Settings Reference](https://developer.apple.com/documentation/xcode/build-settings-reference)
