/**
 * Share Extension で保存失敗したリンクをメインアプリ起動時に同期するフック（スタブ）
 *
 * Share Extension の PendingLinksQueue (Swift) が App Group UserDefaults に
 * 保存した URL を読み取り、Supabase API 経由で保存を試行する予定です。
 *
 * 現在の状況:
 * - Swift 側: PendingLinksQueue が App Group UserDefaults にキューイング済み
 * - React Native 側: App Group UserDefaults の読み取りには
 *   react-native-shared-group-preferences またはカスタム Native Module が必要
 *
 * トークンリフレッシュ機能の追加により Share Extension の失敗ケースは大幅に減少するため、
 * この同期機能の完全実装は次フェーズで対応予定です。
 *
 * @remarks
 * - 現在はスタブ実装（何もしない）
 * - 次のステップ: Native Module を追加して UserDefaults を読み取る
 */
export function usePendingLinksSync(): void {
  // TODO: Native Module 実装後に有効化
}
