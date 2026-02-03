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
 * React Nativeのビルドスクリプト参照を削除する
 * ShareExtensionは純粋なSwiftコードなので、React Nativeのビルドツールは不要
 */
function removeReactNativeBuildSettings(
  buildSettings: Record<string, any>,
): void {
  // React Nativeのビルドスクリプト参照を削除
  const reactNativeBuildTools = [
    "CC",
    "LD",
    "CXX",
    "LDPLUSPLUS",
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
  ];

  for (const tool of reactNativeBuildTools) {
    delete buildSettings[tool];
  }

  // CLANG_ENABLE_EXPLICIT_MODULESを無効化（警告を避けるため）
  buildSettings["CLANG_ENABLE_EXPLICIT_MODULES"] = "NO";

  // React Nativeライブラリのリンクフラグをクリア
  if (buildSettings["OTHER_LDFLAGS"]) {
    const otherLdFlags = buildSettings["OTHER_LDFLAGS"];
    if (typeof otherLdFlags === "string") {
      buildSettings["OTHER_LDFLAGS"] = "";
    } else if (Array.isArray(otherLdFlags)) {
      buildSettings["OTHER_LDFLAGS"] = [];
    }
  }
}

/**
 * ShareExtensionターゲットのビルド設定を構成する
 */
function configureBuildSettings(
  buildSettings: Record<string, any>,
  options: {
    extensionName: string;
    bundleIdentifier: string;
    infoPlistPath: string;
    entitlementsPath: string;
    currentProjectVersion: string;
    marketingVersion: string;
    deploymentTarget: string;
  },
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

  // 基本設定
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

  // React Nativeのビルドスクリプト参照を削除
  removeReactNativeBuildSettings(buildSettings);
}

/**
 * ShareExtensionのファイルをコピーする
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

  // ターゲットディレクトリを作成
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // ShareViewController.swift をコピー（動的設定を適用）
  const viewControllerSource = fs.readFileSync(
    path.join(sourceDir, "ShareViewController.swift"),
    "utf-8",
  );
  const viewControllerUpdated = viewControllerSource.replace(
    /private let keychainService = ".*"/,
    `private let keychainService = "${bundleIdentifier}"`,
  );
  fs.writeFileSync(
    path.join(targetDir, "ShareViewController.swift"),
    viewControllerUpdated,
  );

  // Info.plist をコピー（Supabase設定を追加）
  const infoPlistSource = fs.readFileSync(
    path.join(sourceDir, "Info.plist"),
    "utf-8",
  );

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
  const entitlementsSource = fs.readFileSync(
    path.join(sourceDir, "ShareExtension.entitlements"),
    "utf-8",
  );
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
      throw new Error("Failed to add ShareExtension target");
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
    for (const key in configurations) {
      const configItem = configurations[key];
      if (!configItem.buildSettings) continue;

      const buildSettings = configItem.buildSettings;
      if (buildSettings["PRODUCT_NAME"] === `"${extensionName}"`) {
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
