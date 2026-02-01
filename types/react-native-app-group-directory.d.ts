/**
 * react-native-app-group-directory の型定義
 */
declare module "react-native-app-group-directory" {
  interface AppGroupDirectory {
    getAppGroupDirectory(appGroupId: string): string | null;
  }

  const AppGroupDirectory: AppGroupDirectory;
  export default AppGroupDirectory;
}
