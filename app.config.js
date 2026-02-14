import "tsx/cjs";

const IS_DEV =
  process.env.APP_ENV === "dev" ||
  process.env.EAS_BUILD_PROFILE === "dev" ||
  process.env.EAS_BUILD_PROFILE === "development" ||
  process.env.EAS_BUILD_PROFILE === "preview";

// App Group ID (Share Extension との共有用)
const APP_GROUP_ID = IS_DEV
  ? "group.com.sooom.linkcache.dev"
  : "group.com.sooom.linkcache";

const SLATE_50 = "#f8fafc";

module.exports = {
  expo: {
    name: IS_DEV ? "linkcache-dev" : "linkcache",
    slug: "linkcache",
    owner: "sooom",
    version: "0.1.4",
    orientation: "portrait",
    /** ルートビュー背景色（React ツリー外のネイティブ層）。expo-system-ui 必須 */
    backgroundColor: SLATE_50,
    icon: "./assets/images/new-icon.png",
    scheme: IS_DEV ? "linkcache-dev" : "linkcache",
    userInterfaceStyle: "automatic",
    ios: {
      /** iOS ルートビュー背景色（expo-system-ui 必須） */
      backgroundColor: SLATE_50,
      bundleIdentifier: IS_DEV
        ? "com.sooom.linkcache.dev"
        : "com.sooom.linkcache",
      supportsTablet: true,
      usesNonExemptEncryption: false,
      deploymentTarget: "17.0",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      entitlements: {
        "com.apple.security.application-groups": [APP_GROUP_ID],
        "keychain-access-groups": [
          `$(AppIdentifierPrefix)${IS_DEV ? "com.sooom.linkcache.dev" : "com.sooom.linkcache"}`,
        ],
      },
    },
    android: {
      package: IS_DEV ? "com.sooom.linkcache.dev" : "com.sooom.linkcache",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-system-ui",
      "expo-image",
      "expo-router",
      "expo-secure-store",
      "expo-localization",
      "expo-font",
      "expo-web-browser",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      // Share Extension ターゲット追加
      [
        "./plugins/withShareExtension.ts",
        {
          extensionName: "ShareExtension",
          appGroupId: APP_GROUP_ID,
          bundleIdentifier: IS_DEV
            ? "com.sooom.linkcache.dev"
            : "com.sooom.linkcache",
          supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
          supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
      eas: {
        projectId: "c60046f0-2206-446f-b59a-3336c0bda04f",
        build: {
          experimental: {
            ios: {
              appExtensions: [
                {
                  targetName: "ShareExtension",
                  bundleIdentifier: IS_DEV
                    ? "com.sooom.linkcache.dev.ShareExtension"
                    : "com.sooom.linkcache.ShareExtension",
                  entitlements: {
                    "com.apple.security.application-groups": [APP_GROUP_ID],
                    "keychain-access-groups": [
                      `$(AppIdentifierPrefix)${IS_DEV ? "com.sooom.linkcache.dev" : "com.sooom.linkcache"}`,
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
};
