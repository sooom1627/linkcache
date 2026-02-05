/**
 * withShareExtension Config Plugin のテスト
 *
 * Info.plist / Entitlements / Swift ファイルの文字列変換ロジックを検証する。
 * 今回の「Supabase設定がNSExtensionActivationRule内に誤配置される」バグの
 * 再発防止テストを含む。
 */
import {
  injectSupabaseConfigIntoPlist,
  updateEntitlementsConfig,
  updateKeychainServiceInSwift,
} from "../withShareExtension";

// ============================================================
// テストフィクスチャ: 実際のソースファイル構造を反映
// ============================================================

/** targets/share-extension/Info.plist の構造 */
const INFO_PLIST_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>Shift</string>
    <key>NSExtension</key>
    <dict>
        <key>NSExtensionAttributes</key>
        <dict>
            <key>NSExtensionActivationRule</key>
            <dict>
                <key>NSExtensionActivationSupportsWebURLWithMaxCount</key>
                <integer>1</integer>
            </dict>
        </dict>
        <key>NSExtensionPointIdentifier</key>
        <string>com.apple.share-services</string>
        <key>NSExtensionPrincipalClass</key>
        <string>$(PRODUCT_MODULE_NAME).ShareViewController</string>
    </dict>
</dict>
</plist>`;

/** targets/share-extension/ShareExtension.entitlements の構造（dev環境） */
const ENTITLEMENTS_TEMPLATE_DEV = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.com.sooom.linkcache.dev</string>
    </array>
    <key>keychain-access-groups</key>
    <array>
        <string>$(AppIdentifierPrefix)com.sooom.linkcache.dev</string>
    </array>
</dict>
</plist>`;

/** ShareViewController.swift の keychainService 部分を含む抜粋 */
const SWIFT_TEMPLATE = `class ShareViewController: UIViewController {
    private let colorSlate900 = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1)
    private let keychainService = "com.sooom.linkcache.dev"
    private let supabaseSessionKey = "supabase.session"
}`;

// ============================================================
// injectSupabaseConfigIntoPlist
// ============================================================

describe("injectSupabaseConfigIntoPlist", () => {
  const supabaseUrl = "https://example.supabase.co";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiJ9.test-key";

  it("Supabase設定がトップレベルの<dict>に配置される", () => {
    const result = injectSupabaseConfigIntoPlist(
      INFO_PLIST_TEMPLATE,
      supabaseUrl,
      supabaseAnonKey,
    );

    // トップレベルに配置されていることを確認
    // </dict>\n</plist> の直前にキーが存在する
    expect(result).toContain(`<key>SUPABASE_URL</key>`);
    expect(result).toContain(`<string>${supabaseUrl}</string>`);
    expect(result).toContain(`<key>SUPABASE_ANON_KEY</key>`);
    expect(result).toContain(`<string>${supabaseAnonKey}</string>`);
  });

  it("Supabase設定がNSExtensionActivationRule内に配置されない（バグ再発防止）", () => {
    const result = injectSupabaseConfigIntoPlist(
      INFO_PLIST_TEMPLATE,
      supabaseUrl,
      supabaseAnonKey,
    );

    // NSExtensionActivationRule辞書の中にSupabase設定が入っていないことを確認
    // NSExtensionActivationSupportsWebURLWithMaxCount と SUPABASE_URL の間に
    // </dict> が存在すること = 別の辞書レベルにあること
    const activationRuleStart = result.indexOf(
      "NSExtensionActivationSupportsWebURLWithMaxCount",
    );
    const supabaseUrlPos = result.indexOf("<key>SUPABASE_URL</key>");
    const closingDictBetween = result
      .substring(activationRuleStart, supabaseUrlPos)
      .match(/<\/dict>/g);

    // ActivationRule → SUPABASE_URL の間に少なくとも3つの</dict>が必要
    // (ActivationRule辞書 + NSExtensionAttributes辞書 + NSExtension辞書)
    expect(closingDictBetween).not.toBeNull();
    expect(closingDictBetween!.length).toBeGreaterThanOrEqual(3);
  });

  it("SUPABASE_URL が </dict></plist> の直前に配置される", () => {
    const result = injectSupabaseConfigIntoPlist(
      INFO_PLIST_TEMPLATE,
      supabaseUrl,
      supabaseAnonKey,
    );

    // SUPABASE_ANON_KEY の後に </dict>\n</plist> で終わることを確認
    const endPattern =
      /<string>eyJhbGciOiJIUzI1NiJ9\.test-key<\/string>\n<\/dict>\n<\/plist>$/;
    expect(result).toMatch(endPattern);
  });

  it("元のplist構造が破壊されない", () => {
    const result = injectSupabaseConfigIntoPlist(
      INFO_PLIST_TEMPLATE,
      supabaseUrl,
      supabaseAnonKey,
    );

    // 元の要素が保持されている
    expect(result).toContain("<key>CFBundleDisplayName</key>");
    expect(result).toContain(
      "<key>NSExtensionActivationSupportsWebURLWithMaxCount</key>",
    );
    expect(result).toContain("<string>com.apple.share-services</string>");
  });
});

// ============================================================
// updateEntitlementsConfig
// ============================================================

describe("updateEntitlementsConfig", () => {
  describe("dev環境", () => {
    it("App Group IDが正しく置換される", () => {
      const result = updateEntitlementsConfig(
        ENTITLEMENTS_TEMPLATE_DEV,
        "group.com.sooom.linkcache.dev",
        "com.sooom.linkcache.dev",
      );

      expect(result).toContain(
        "<string>group.com.sooom.linkcache.dev</string>",
      );
    });

    it("Keychain Access Groupが正しく置換される", () => {
      const result = updateEntitlementsConfig(
        ENTITLEMENTS_TEMPLATE_DEV,
        "group.com.sooom.linkcache.dev",
        "com.sooom.linkcache.dev",
      );

      expect(result).toContain(
        "<string>$(AppIdentifierPrefix)com.sooom.linkcache.dev</string>",
      );
    });
  });

  describe("production環境", () => {
    /** production版テンプレート（.devなし） */
    const ENTITLEMENTS_TEMPLATE_PROD = ENTITLEMENTS_TEMPLATE_DEV.replace(
      "group.com.sooom.linkcache.dev",
      "group.com.sooom.linkcache",
    ).replace(
      "$(AppIdentifierPrefix)com.sooom.linkcache.dev",
      "$(AppIdentifierPrefix)com.sooom.linkcache",
    );

    it("App Group IDがproduction用に置換される", () => {
      const result = updateEntitlementsConfig(
        ENTITLEMENTS_TEMPLATE_PROD,
        "group.com.sooom.linkcache",
        "com.sooom.linkcache",
      );

      expect(result).toContain("<string>group.com.sooom.linkcache</string>");
      expect(result).not.toContain(
        "<string>group.com.sooom.linkcache.dev</string>",
      );
    });

    it("Keychain Access Groupがproduction用に置換される", () => {
      const result = updateEntitlementsConfig(
        ENTITLEMENTS_TEMPLATE_PROD,
        "group.com.sooom.linkcache",
        "com.sooom.linkcache",
      );

      expect(result).toContain(
        "<string>$(AppIdentifierPrefix)com.sooom.linkcache</string>",
      );
    });
  });

  describe("エラーハンドリング", () => {
    it("App Group IDパターンが見つからない場合にエラーを投げる", () => {
      const invalidContent = `<dict><string>invalid</string></dict>`;

      expect(() =>
        updateEntitlementsConfig(
          invalidContent,
          "group.com.sooom.linkcache.dev",
          "com.sooom.linkcache.dev",
        ),
      ).toThrow("Failed to find App Group ID pattern");
    });

    it("Keychain Access Groupパターンが見つからない場合にエラーを投げる", () => {
      // App Groupは存在するがKeychainがない
      const partialContent = `<dict>
    <string>group.com.sooom.linkcache.dev</string>
    <string>invalid-keychain</string>
</dict>`;

      expect(() =>
        updateEntitlementsConfig(
          partialContent,
          "group.com.sooom.linkcache.dev",
          "com.sooom.linkcache.dev",
        ),
      ).toThrow("Failed to find Keychain Access Group pattern");
    });
  });
});

// ============================================================
// updateKeychainServiceInSwift
// ============================================================

describe("updateKeychainServiceInSwift", () => {
  it("keychainServiceがdev環境のbundleIdentifierに置換される", () => {
    const result = updateKeychainServiceInSwift(
      SWIFT_TEMPLATE,
      "com.sooom.linkcache.dev",
    );

    expect(result).toContain(
      'private let keychainService = "com.sooom.linkcache.dev"',
    );
  });

  it("keychainServiceがproduction環境のbundleIdentifierに置換される", () => {
    const result = updateKeychainServiceInSwift(
      SWIFT_TEMPLATE,
      "com.sooom.linkcache",
    );

    expect(result).toContain(
      'private let keychainService = "com.sooom.linkcache"',
    );
    expect(result).not.toContain(
      'private let keychainService = "com.sooom.linkcache.dev"',
    );
  });

  it("keychainService以外のコードが変更されない", () => {
    const result = updateKeychainServiceInSwift(
      SWIFT_TEMPLATE,
      "com.sooom.linkcache",
    );

    expect(result).toContain("class ShareViewController: UIViewController");
    expect(result).toContain('supabaseSessionKey = "supabase.session"');
    expect(result).toContain("colorSlate900");
  });

  it("keychainServiceパターンが見つからない場合にエラーを投げる", () => {
    const invalidSwift = `class ShareViewController: UIViewController {
    private let someOtherProperty = "value"
}`;

    expect(() =>
      updateKeychainServiceInSwift(invalidSwift, "com.sooom.linkcache"),
    ).toThrow("Failed to find keychainService pattern");
  });
});
