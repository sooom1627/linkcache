import { Alert } from "react-native";

import * as ImagePicker from "expo-image-picker";

/**
 * 画像選択結果の型
 */
export interface PickedImage {
  uri: string;
  mimeType: string;
  width: number;
  height: number;
}

/**
 * useImagePicker フックの戻り値の型
 */
export interface UseImagePickerReturn {
  checkPermissions: () => Promise<{
    library: boolean;
    camera: boolean;
  }>;
  requestLibraryPermission: () => Promise<boolean>;
  requestCameraPermission: () => Promise<boolean>;
  pickImageFromLibrary: () => Promise<PickedImage | null>;
  pickImageFromCamera: () => Promise<PickedImage | null>;
}

/**
 * 画像選択用のカスタムフック
 *
 * expo-image-pickerを使用して、ライブラリまたはカメラから画像を選択します。
 * パーミッション管理も含みます。
 *
 * @returns 画像選択関数とパーミッションチェック関数
 *
 * @example
 * ```tsx
 * const { pickImageFromLibrary, pickImageFromCamera, checkPermissions } = useImagePicker();
 *
 * // パーミッションを事前確認
 * const permissions = await checkPermissions();
 *
 * // ライブラリから選択
 * const image = await pickImageFromLibrary();
 * if (image) {
 *   console.log('Selected:', image.uri);
 * }
 *
 * // カメラで撮影
 * const photo = await pickImageFromCamera();
 * if (photo) {
 *   console.log('Captured:', photo.uri);
 * }
 * ```
 */
export function useImagePicker(): UseImagePickerReturn {
  /**
   * パーミッション状態を事前確認
   * @returns ライブラリとカメラのパーミッション状態
   */
  const checkPermissions = async () => {
    const [libraryStatus, cameraStatus] = await Promise.all([
      ImagePicker.getMediaLibraryPermissionsAsync(),
      ImagePicker.getCameraPermissionsAsync(),
    ]);

    return {
      library: libraryStatus.status === "granted",
      camera: cameraStatus.status === "granted",
    };
  };

  /**
   * ライブラリパーミッションをリクエスト
   */
  const requestLibraryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  };

  /**
   * カメラパーミッションをリクエスト
   */
  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  };

  /**
   * ライブラリから画像を選択（パーミッションは事前取得済みを想定）
   * @returns 選択された画像情報（キャンセル時はnull）
   */
  const pickImageFromLibrary = async (): Promise<PickedImage | null> => {
    try {
      // 画像を選択
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      // キャンセルされた場合
      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];

      if (!asset) {
        return null;
      }

      return {
        uri: asset.uri,
        mimeType: asset.mimeType || "image/jpeg",
        width: asset.width,
        height: asset.height,
      };
    } catch (error) {
      console.error("Error picking image from library:", error);
      Alert.alert("Error", "Could not select image. Please try again.");
      return null;
    }
  };

  /**
   * カメラで撮影（パーミッションは事前取得済みを想定）
   * @returns 撮影された画像情報（キャンセル時はnull）
   */
  const pickImageFromCamera = async (): Promise<PickedImage | null> => {
    try {
      // カメラを起動
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      // キャンセルされた場合
      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];

      if (!asset) {
        return null;
      }

      return {
        uri: asset.uri,
        mimeType: asset.mimeType || "image/jpeg",
        width: asset.width,
        height: asset.height,
      };
    } catch (error) {
      console.error("Error taking photo with camera:", error);
      Alert.alert("Error", "Could not take photo. Please try again.");
      return null;
    }
  };

  return {
    checkPermissions,
    requestLibraryPermission,
    requestCameraPermission,
    pickImageFromLibrary,
    pickImageFromCamera,
  };
}
