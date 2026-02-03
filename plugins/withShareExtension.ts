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
  // 注意: clang++はpbxproj形式で+記号が特殊文字扱いされるためクォートが必要
  buildSettings["CC"] = "clang";
  buildSettings["CXX"] = '"clang++"';
  buildSettings["LD"] = "clang";
  buildSettings["LDPLUSPLUS"] = '"clang++"';

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
  
  // keychainServiceを動的に設定（dev環境: com.sooom.linkcache.dev）
  // 正規表現を改善: より確実にマッチするように、行全体をマッチさせる
  const keychainServicePattern = /private let keychainService = "[^"]*"/;
  const keychainServiceReplacement = `private let keychainService = "${bundleIdentifier}"`;
  
  if (!keychainServicePattern.test(viewControllerSource)) {
    throw new Error(
      `Failed to find keychainService pattern in ShareViewController.swift`,
    );
  }
  
  const viewControllerUpdated = viewControllerSource.replace(
    keychainServicePattern,
    keychainServiceReplacement,
  );
  
  // 置換が成功したことを確認
  if (!viewControllerUpdated.includes(`keychainService = "${bundleIdentifier}"`)) {
    throw new Error(
      `Failed to replace keychainService in ShareViewController.swift. Expected: ${bundleIdentifier}`,
    );
  }
  
  console.log(
    `[withShareExtension] Updated keychainService to: ${bundleIdentifier}`,
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
  
  // App Group IDを動的に設定（dev環境: group.com.sooom.linkcache.dev）
  // より柔軟な正規表現: dev/production環境の両方に対応
  const appGroupPattern = /<string>group\.com\.sooom\.linkcache(\.dev)?<\/string>/;
  const appGroupReplacement = `<string>${appGroupId}</string>`;
  
  // Keychain Access Groupを動的に設定
  // $(AppIdentifierPrefix)com.sooom.linkcache.dev または $(AppIdentifierPrefix)com.sooom.linkcache
  const keychainAccessGroupPattern =
    /<string>\$\(AppIdentifierPrefix\)com\.sooom\.linkcache(\.dev)?<\/string>/;
  const keychainAccessGroupReplacement = `<string>$(AppIdentifierPrefix)${bundleIdentifier}</string>`;
  
  let entitlementsUpdated = entitlementsSource;
  
  // App Group IDの置換
  if (!appGroupPattern.test(entitlementsSource)) {
    throw new Error(
      `Failed to find App Group ID pattern in ShareExtension.entitlements`,
    );
  }
  entitlementsUpdated = entitlementsUpdated.replace(
    appGroupPattern,
    appGroupReplacement,
  );
  
  // Keychain Access Groupの置換
  if (!keychainAccessGroupPattern.test(entitlementsSource)) {
    throw new Error(
      `Failed to find Keychain Access Group pattern in ShareExtension.entitlements`,
    );
  }
  entitlementsUpdated = entitlementsUpdated.replace(
    keychainAccessGroupPattern,
    keychainAccessGroupReplacement,
  );
  
  // 置換が成功したことを確認
  if (!entitlementsUpdated.includes(`<string>${appGroupId}</string>`)) {
    throw new Error(
      `Failed to replace App Group ID in ShareExtension.entitlements. Expected: ${appGroupId}`,
    );
  }
  if (
    !entitlementsUpdated.includes(
      `<string>$(AppIdentifierPrefix)${bundleIdentifier}</string>`,
    )
  ) {
    throw new Error(
      `Failed to replace Keychain Access Group in ShareExtension.entitlements. Expected: $(AppIdentifierPrefix)${bundleIdentifier}`,
    );
  }
  
  console.log(
    `[withShareExtension] Updated App Group ID to: ${appGroupId}`,
  );
  console.log(
    `[withShareExtension] Updated Keychain Access Group to: $(AppIdentifierPrefix)${bundleIdentifier}`,
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

  // Podfileを修正してpost_installフックを追加
  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile",
      );

      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, "utf-8");

        // post_installフックにShareExtension用の設定を追加
        const postInstallAddition = `
    # ShareExtension: 全Podsターゲットで明示的モジュールを無効化
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['CLANG_ENABLE_EXPLICIT_MODULES'] = 'NO'
      end
    end
    installer.pods_project.build_configurations.each do |build_config|
      build_config.build_settings['CLANG_ENABLE_EXPLICIT_MODULES'] = 'NO'
    end
    installer.pods_project.save

    # ShareExtension: 標準コンパイラを使用するよう設定
    main_project = installer.aggregate_targets.first&.user_project
    if main_project
      main_project.native_targets.each do |target|
        if target.name == '${extensionName}'
          target.build_configurations.each do |build_config|
            build_config.build_settings['CC'] = 'clang'
            build_config.build_settings['CXX'] = 'clang++'
            build_config.build_settings['LD'] = 'clang'
            build_config.build_settings['LDPLUSPLUS'] = 'clang++'
            build_config.build_settings.delete('CCACHE_BINARY')
            build_config.build_settings.delete('C_COMPILER_LAUNCHER')
            build_config.build_settings.delete('CXX_COMPILER_LAUNCHER')
            build_config.build_settings.delete('LDPLUSPLUS_COMPILER_LAUNCHER')
            build_config.build_settings['CLANG_ENABLE_EXPLICIT_MODULES'] = 'NO'
          end
        end
      end
      main_project.save
    end`;

        // post_installブロックの末尾（endの前）にコードを挿入
        // react_native_post_install呼び出しの後に追加
        const postInstallEndPattern =
          /(\s*react_native_post_install\s*\([^)]+\)[^)]*\))/;
        if (postInstallEndPattern.test(podfileContent)) {
          podfileContent = podfileContent.replace(
            postInstallEndPattern,
            `$1${postInstallAddition}`,
          );
          fs.writeFileSync(podfilePath, podfileContent, "utf-8");
          console.log(
            "[withShareExtension] Added post_install hooks to Podfile",
          );
        } else {
          console.warn(
            "[withShareExtension] Could not find react_native_post_install in Podfile",
          );
        }
      }

      return config;
    },
  ]);

  return config;
};

export default withShareExtension;
