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
 * 画像選択用のカスタムフック
 *
 * expo-image-pickerを使用して、ライブラリまたはカメラから画像を選択します。
 * パーミッション管理も含みます。
 *
 * @returns 画像選択関数
 *
 * @example
 * ```tsx
 * const { pickImageFromLibrary, pickImageFromCamera } = useImagePicker();
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
export function useImagePicker() {
  /**
   * ライブラリから画像を選択
   * @returns 選択された画像情報（キャンセル時はnull）
   */
  const pickImageFromLibrary = async (): Promise<PickedImage | null> => {
    try {
      // パーミッションをリクエスト
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library.",
        );
        return null;
      }

      // 画像を選択
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
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
   * カメラで撮影
   * @returns 撮影された画像情報（キャンセル時はnull）
   */
  const pickImageFromCamera = async (): Promise<PickedImage | null> => {
    try {
      // パーミッションをリクエスト
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow camera access.");
        return null;
      }

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
    pickImageFromLibrary,
    pickImageFromCamera,
  };
}
