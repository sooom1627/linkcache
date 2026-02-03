import * as fs from "fs";
import * as path from "path";

import type { ConfigPlugin } from "@expo/config-plugins";
import { withDangerousMod, withXcodeProject } from "@expo/config-plugins";

/**
 * Share Extension 設定の型
 */
interface WithShareExtensionOptions {
  /** Share Extension の名前 */
  extensionName: string;
  /** App Group ID */
  appGroupId: string;
  /** Bundle Identifier */
  bundleIdentifier: string;
  /** Supabase URL */
  supabaseUrl?: string;
  /** Supabase Anon Key */
  supabaseAnonKey?: string;
}

/**
 * ビルド設定の型定義
 */
interface BuildSettings {
  [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * React Nativeのビルドスクリプト参照を削除し、標準コンパイラを設定する
 *
 * ShareExtensionは純粋なSwiftコードなので、React Nativeのビルドツールは不要です。
 * Expoプロジェクトではreact-native/scripts/xcode/ccache-clang.shへのパスが壊れるため、
 * 明示的に標準のXcodeコンパイラ（clang/clang++）を設定する必要があります。
 *
 * 注意: 空文字列の設定はxcode-projectライブラリで正しく保存されない場合があるため、
 * 明示的なコンパイラ名を設定することで確実にオーバーライドします。
 */
function removeReactNativeBuildSettings(buildSettings: BuildSettings): void {
  // 明示的にXcodeの標準コンパイラを設定
  // これによりプロジェクトレベルのccache wrapper設定を確実にオーバーライド
  buildSettings["CC"] = "clang";
  buildSettings["CXX"] = "clang++";
  buildSettings["LD"] = "clang";
  buildSettings["LDPLUSPLUS"] = "clang++";

  // ShareExtensionに不要な設定を削除
  const toolsToRemove = [
    "SWIFT",
    "LIBTOOL",
    "AR",
    "RANLIB",
    "STRIP",
    "NM",
    "OBJCOPY",
    "OBJDUMP",
    "READELF",
    "C_COMPILER_LAUNCHER",
    "CXX_COMPILER_LAUNCHER",
    "LDPLUSPLUS_COMPILER_LAUNCHER",
    "CCACHE_BINARY",
    "REACT_NATIVE_PATH",
    "REACT_NATIVE_NODE_MODULES_DIR",
    "REACT_NATIVE_PACKAGE_JSON",
  ] as const;

  for (const tool of toolsToRemove) {
    delete buildSettings[tool];
  }

  // CLANG_ENABLE_EXPLICIT_MODULESを無効化（警告を避けるため）
  // これは必須: ShareExtensionは標準のXcodeビルドツールを使用するため
  buildSettings["CLANG_ENABLE_EXPLICIT_MODULES"] = "NO";

  // CLANG_ENABLE_EXPLICIT_MODULES_WITH_COMPILER_LAUNCHERも無効化
  buildSettings["CLANG_ENABLE_EXPLICIT_MODULES_WITH_COMPILER_LAUNCHER"] = "NO";

  // React Nativeライブラリのリンクフラグをクリア
  if (buildSettings["OTHER_LDFLAGS"]) {
    const otherLdFlags = buildSettings["OTHER_LDFLAGS"];
    if (typeof otherLdFlags === "string") {
      buildSettings["OTHER_LDFLAGS"] = "$(inherited)";
    } else if (Array.isArray(otherLdFlags)) {
      buildSettings["OTHER_LDFLAGS"] = ["$(inherited)"];
    }
  }
}

/**
 * ShareExtensionターゲットのビルド設定を構成する
 */
interface BuildSettingsOptions {
  extensionName: string;
  bundleIdentifier: string;
  infoPlistPath: string;
  entitlementsPath: string;
  currentProjectVersion: string;
  marketingVersion: string;
  deploymentTarget: string;
}

function configureBuildSettings(
  buildSettings: BuildSettings,
  options: BuildSettingsOptions,
): void {
  const {
    extensionName,
    bundleIdentifier,
    infoPlistPath,
    entitlementsPath,
    currentProjectVersion,
    marketingVersion,
    deploymentTarget,
  } = options;

  // 重要: React Nativeのビルドスクリプト参照を先に削除
  // これにより、後で設定する値が上書きされないようにする
  removeReactNativeBuildSettings(buildSettings);

  // 基本設定（ShareExtensionに必要な最小限の設定）
  buildSettings["CLANG_ENABLE_MODULES"] = "YES";
  buildSettings["INFOPLIST_FILE"] = `"${infoPlistPath}"`;
  buildSettings["CODE_SIGN_ENTITLEMENTS"] = `"${entitlementsPath}"`;
  buildSettings["CODE_SIGN_STYLE"] = "Automatic";
  buildSettings["CURRENT_PROJECT_VERSION"] = `"${currentProjectVersion}"`;
  buildSettings["GENERATE_INFOPLIST_FILE"] = "NO";
  buildSettings["MARKETING_VERSION"] = `"${marketingVersion}"`;
  buildSettings["PRODUCT_BUNDLE_IDENTIFIER"] =
    `"${bundleIdentifier}.${extensionName}"`;
  buildSettings["SWIFT_EMIT_LOC_STRINGS"] = "YES";
  buildSettings["SWIFT_VERSION"] = "5.0";
  buildSettings["TARGETED_DEVICE_FAMILY"] = `"1,2"`;
  buildSettings["IPHONEOS_DEPLOYMENT_TARGET"] = deploymentTarget;
  
  // 追加の設定: ShareExtensionが標準のXcodeビルドツールを使用することを保証
  buildSettings["SKIP_INSTALL"] = "YES"; // App ExtensionはSKIP_INSTALLが必要
  buildSettings["ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES"] = "NO"; // App Extensionでは不要
}

/**
 * ShareExtensionのファイルをコピーする
 *
 * @throws {Error} ソースファイルが存在しない場合
 */
function copyShareExtensionFiles(
  sourceDir: string,
  targetDir: string,
  options: WithShareExtensionOptions,
): void {
  const {
    extensionName,
    bundleIdentifier,
    appGroupId,
    supabaseUrl,
    supabaseAnonKey,
  } = options;

  // ソースディレクトリの存在確認
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`ShareExtension source directory not found: ${sourceDir}`);
  }

  // ターゲットディレクトリを作成
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // ShareViewController.swift をコピー（動的設定を適用）
  const viewControllerPath = path.join(sourceDir, "ShareViewController.swift");
  if (!fs.existsSync(viewControllerPath)) {
    throw new Error(
      `ShareViewController.swift not found: ${viewControllerPath}`,
    );
  }

  const viewControllerSource = fs.readFileSync(viewControllerPath, "utf-8");
  const viewControllerUpdated = viewControllerSource.replace(
    /private let keychainService = ".*"/,
    `private let keychainService = "${bundleIdentifier}"`,
  );
  fs.writeFileSync(
    path.join(targetDir, "ShareViewController.swift"),
    viewControllerUpdated,
  );

  // Info.plist をコピー（Supabase設定を追加）
  const infoPlistPath = path.join(sourceDir, "Info.plist");
  if (!fs.existsSync(infoPlistPath)) {
    throw new Error(`Info.plist not found: ${infoPlistPath}`);
  }

  const infoPlistSource = fs.readFileSync(infoPlistPath, "utf-8");
  let infoPlistUpdated = infoPlistSource;

  if (supabaseUrl && supabaseAnonKey) {
    infoPlistUpdated = infoPlistSource.replace(
      "</dict>",
      `    <key>SUPABASE_URL</key>
    <string>${supabaseUrl}</string>
    <key>SUPABASE_ANON_KEY</key>
    <string>${supabaseAnonKey}</string>
</dict>`,
    );
  } else {
    console.warn(
      "[withShareExtension] Supabase URL or Anon Key is missing. Share Extension may not work correctly.",
    );
  }

  fs.writeFileSync(path.join(targetDir, "Info.plist"), infoPlistUpdated);

  // Entitlements をコピー（App Group ID と Keychain Access Group を動的に設定）
  const entitlementsPath = path.join(sourceDir, "ShareExtension.entitlements");
  if (!fs.existsSync(entitlementsPath)) {
    throw new Error(
      `ShareExtension.entitlements not found: ${entitlementsPath}`,
    );
  }

  const entitlementsSource = fs.readFileSync(entitlementsPath, "utf-8");
  let entitlementsUpdated = entitlementsSource.replace(
    /<string>group\.com\.sooom\.linkcache\.dev<\/string>/,
    `<string>${appGroupId}</string>`,
  );
  entitlementsUpdated = entitlementsUpdated.replace(
    /<string>\$\(AppIdentifierPrefix\)com\.sooom\.linkcache\.dev<\/string>/,
    `<string>$(AppIdentifierPrefix)${bundleIdentifier}</string>`,
  );
  fs.writeFileSync(
    path.join(targetDir, `${extensionName}.entitlements`),
    entitlementsUpdated,
  );
}

/**
 * iOS Share Extension ターゲットを追加する Config Plugin
 *
 * このプラグインは以下を行います:
 * 1. Xcodeプロジェクトに ShareExtension ターゲットを追加
 * 2. 必要なソースファイル、リソース、entitlements を設定
 * 3. ビルド設定を構成（React Nativeのビルドスクリプト参照を削除）
 *
 * @param config Expo 設定オブジェクト
 * @param options Share Extension 設定
 * @returns 更新された設定オブジェクト
 */
const withShareExtension: ConfigPlugin<WithShareExtensionOptions> = (
  config,
  options,
) => {
  const { extensionName, bundleIdentifier } = options;

  // Xcode プロジェクトにターゲットを追加
  config = withXcodeProject(config, async (config) => {
    const pbxProject = config.modResults;

    // ShareExtension ターゲットの追加
    const target = pbxProject.addTarget(
      extensionName,
      "app_extension",
      extensionName,
      `${bundleIdentifier}.${extensionName}`,
    );

    if (!target) {
      throw new Error(`Failed to add ShareExtension target: ${extensionName}`);
    }

    // ビルドフェーズを追加
    pbxProject.addBuildPhase(
      [],
      "PBXSourcesBuildPhase",
      "Sources",
      target.uuid,
    );
    pbxProject.addBuildPhase(
      [],
      "PBXResourcesBuildPhase",
      "Resources",
      target.uuid,
    );
    pbxProject.addBuildPhase(
      [],
      "PBXFrameworksBuildPhase",
      "Frameworks",
      target.uuid,
    );

    // ShareExtension 用の PBXGroup を作成
    const pbxGroupKey = pbxProject.pbxCreateGroup(extensionName, extensionName);

    // ファイルパスの定義
    const infoPlistPath = `${extensionName}/Info.plist`;
    const entitlementsPath = `${extensionName}/${extensionName}.entitlements`;
    const viewControllerPath = `${extensionName}/ShareViewController.swift`;

    // ファイルを追加
    pbxProject.addFile(infoPlistPath, pbxGroupKey);
    pbxProject.addFile(entitlementsPath, pbxGroupKey);
    pbxProject.addSourceFile(
      viewControllerPath,
      { target: target.uuid },
      pbxGroupKey,
    );

    // ビルド設定を構成
    const configurations = pbxProject.pbxXCBuildConfigurationSection();
    const currentProjectVersion = config.ios?.buildNumber || "1";
    const marketingVersion = config.version || "1.0.0";
    const deploymentTarget = (config.ios as any)?.deploymentTarget || "17.0";

    // ShareExtensionターゲットのビルド設定を検索して修正
    // すべての設定（Debug/Release）に対して適用
    for (const key in configurations) {
      const configItem = configurations[key];
      if (!configItem || !configItem.buildSettings) {
        continue;
      }

      const buildSettings = configItem.buildSettings;
      const productName = buildSettings["PRODUCT_NAME"];

      // PRODUCT_NAMEでShareExtensionターゲットを識別
      if (productName === `"${extensionName}"`) {
        // ShareExtensionの設定を構成
        // configureBuildSettings内でReact Nativeのビルドスクリプト参照が削除される
        configureBuildSettings(buildSettings, {
          extensionName,
          bundleIdentifier,
          infoPlistPath,
          entitlementsPath,
          currentProjectVersion,
          marketingVersion,
          deploymentTarget,
        });
      }
    }

    return config;
  });

  // ShareExtension のファイルをコピー
  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const platformProjectRoot = config.modRequest.platformProjectRoot;
      const sourceDir = path.join(
        config.modRequest.projectRoot,
        "targets",
        "share-extension",
      );
      const targetDir = path.join(platformProjectRoot, extensionName);

      copyShareExtensionFiles(sourceDir, targetDir, options);

      return config;
    },
  ]);

  return config;
};

export default withShareExtension;
