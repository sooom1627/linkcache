import Foundation
import Security

// MARK: - Keychain Service

/// Keychainからの認証トークン取得を担当
enum KeychainService {

    /// Supabase セッションキー（Expo SecureStoreと同じ）
    private static let supabaseSessionKey = "supabase.session"

    /// Keychain サービス名
    /// 注意: withShareExtension.tsプラグインがこのプロパティ値を動的に置換します。
    /// 現在のKeychain検索ではService名を指定しない方式を採用しているため、
    /// この値は直接使用されていませんが、プラグイン互換性のため保持しています。
    private static let keychainService = "com.sooom.linkcache.dev"

    /// Keychainから Supabase セッショントークンを取得（必要に応じてリフレッシュ）
    ///
    /// Expo SecureStore と同じ Keychain Access Group を使用して、
    /// メインアプリで保存された認証トークンを読み取ります。
    /// トークンの有効期限が切れている場合は、refresh_token を使用して
    /// 新しいアクセストークンを取得します。
    ///
    /// - Parameter completion: 有効な access_token、取得失敗の場合は nil
    static func getSupabaseToken(completion: @escaping (String?) -> Void) {
        guard let sessionData = readSessionFromKeychain() else {
            completion(nil)
            return
        }

        do {
            guard let json = try JSONSerialization.jsonObject(with: sessionData) as? [String: Any],
                  let accessToken = json["access_token"] as? String else {
                #if DEBUG
                print("[ShareExtension] Failed to parse access_token from JSON")
                #endif
                completion(nil)
                return
            }

            // トークンの有効期限をチェック
            guard let expiresAt = json["expires_at"] as? TimeInterval else {
                #if DEBUG
                print("[ShareExtension] expires_at not found in session - treating token as invalid")
                #endif
                completion(nil)
                return
            }

            let expirationDate = Date(timeIntervalSince1970: expiresAt)

            // 期限に余裕がある場合はそのまま返す（30秒のバッファ）
            if expirationDate > Date().addingTimeInterval(30) {
                #if DEBUG
                print("[ShareExtension] Token is valid, expires at: \(expirationDate)")
                #endif
                completion(accessToken)
                return
            }

            // 期限切れ or 間もなく切れる場合はリフレッシュを試行
            #if DEBUG
            print("[ShareExtension] Token expired or expiring soon, attempting refresh...")
            #endif

            guard let refreshToken = json["refresh_token"] as? String else {
                #if DEBUG
                print("[ShareExtension] No refresh_token found in session")
                #endif
                completion(nil)
                return
            }

            refreshAccessToken(refreshToken: refreshToken) { newToken in
                completion(newToken)
            }
        } catch {
            #if DEBUG
            print("[ShareExtension] Failed to parse Supabase session: \(error)")
            #endif
            completion(nil)
        }
    }

    /// 同期版（後方互換性のため保持、新コードはasync版を使用すること）
    static func getSupabaseTokenSync() -> String? {
        guard let sessionData = readSessionFromKeychain() else {
            return nil
        }

        do {
            guard let json = try JSONSerialization.jsonObject(with: sessionData) as? [String: Any],
                  let accessToken = json["access_token"] as? String else {
                return nil
            }

            guard let expiresAt = json["expires_at"] as? TimeInterval else {
                return nil
            }

            let expirationDate = Date(timeIntervalSince1970: expiresAt)
            if expirationDate <= Date() {
                return nil
            }

            return accessToken
        } catch {
            return nil
        }
    }

    // MARK: - Private Helpers

    /// Keychainからセッションデータを読み取る
    private static func readSessionFromKeychain() -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: supabaseSessionKey,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        #if DEBUG
        print("[ShareExtension] Attempting to retrieve token from Keychain")
        print("[ShareExtension] Account: \(supabaseSessionKey)")
        #endif

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        #if DEBUG
        print("[ShareExtension] Keychain access status: \(status)")
        if status != errSecSuccess {
            if status == errSecItemNotFound {
                print("[ShareExtension] Token not found in Keychain (errSecItemNotFound)")
            } else if status == errSecAuthFailed {
                print("[ShareExtension] Keychain access denied (errSecAuthFailed)")
            } else {
                print("[ShareExtension] Keychain access failed with error: \(status)")
            }
        }
        #endif

        guard status == errSecSuccess,
              let data = result as? Data else {
            #if DEBUG
            print("[ShareExtension] Failed to retrieve Supabase token from Keychain")
            #endif
            return nil
        }

        #if DEBUG
        print("[ShareExtension] Retrieved data from Keychain: \(data.count) bytes")
        #endif

        return data
    }

    /// Supabase Auth API を使用してトークンをリフレッシュ
    private static func refreshAccessToken(refreshToken: String, completion: @escaping (String?) -> Void) {
        let supabaseUrl = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_URL") as? String ?? ""
        let supabaseAnonKey = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String ?? ""

        guard !supabaseUrl.isEmpty, !supabaseAnonKey.isEmpty else {
            #if DEBUG
            print("[ShareExtension] Cannot refresh: Supabase config missing")
            #endif
            completion(nil)
            return
        }

        let endpoint = "\(supabaseUrl)/auth/v1/token?grant_type=refresh_token"
        guard let url = URL(string: endpoint) else {
            completion(nil)
            return
        }

        let body: [String: Any] = ["refresh_token": refreshToken]
        guard let jsonData = try? JSONSerialization.data(withJSONObject: body) else {
            completion(nil)
            return
        }

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 10.0
        let session = URLSession(configuration: config)

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.httpBody = jsonData

        let task = session.dataTask(with: request) { data, response, error in
            session.finishTasksAndInvalidate()

            guard error == nil,
                  let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200,
                  let data = data else {
                #if DEBUG
                print("[ShareExtension] Token refresh failed: \(error?.localizedDescription ?? "unknown")")
                #endif
                completion(nil)
                return
            }

            do {
                guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                      let newAccessToken = json["access_token"] as? String else {
                    #if DEBUG
                    print("[ShareExtension] Failed to parse refreshed token")
                    #endif
                    completion(nil)
                    return
                }

                // リフレッシュ成功: Keychainに新しいセッションを保存
                // メインアプリが次回起動時に最新のセッションを読み取れるようにする
                saveSessionToKeychain(json)

                #if DEBUG
                print("[ShareExtension] Token refreshed successfully")
                #endif
                completion(newAccessToken)
            } catch {
                #if DEBUG
                print("[ShareExtension] Failed to parse refresh response: \(error)")
                #endif
                completion(nil)
            }
        }

        task.resume()
    }

    /// リフレッシュ後のセッションをKeychainに書き戻す
    private static func saveSessionToKeychain(_ sessionJson: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: sessionJson) else {
            #if DEBUG
            print("[ShareExtension] Failed to serialize refreshed session for Keychain")
            #endif
            return
        }

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: supabaseSessionKey
        ]

        let attributes: [String: Any] = [
            kSecValueData as String: data
        ]

        let status = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)

        #if DEBUG
        if status == errSecSuccess {
            print("[ShareExtension] Refreshed session saved to Keychain")
        } else {
            print("[ShareExtension] Failed to save refreshed session to Keychain: \(status)")
        }
        #endif
    }
}

// MARK: - Pending Links Queue

/// Share Extension で保存失敗したリンクをApp Group UserDefaultsにキューイング
enum PendingLinksQueue {

    /// App Group identifier
    private static var appGroupId: String {
        let bundleId = Bundle.main.bundleIdentifier ?? ""
        // Share Extension のバンドルIDから App Group ID を推定
        // com.sooom.linkcache.dev.share-extension -> group.com.sooom.linkcache.dev
        // com.sooom.linkcache.share-extension -> group.com.sooom.linkcache
        let base = bundleId.replacingOccurrences(of: ".share-extension", with: "")
        return "group.\(base)"
    }

    private static let pendingLinksKey = "pendingLinks"

    /// 保存失敗したリンクをキューに追加
    ///
    /// App Group の UserDefaults に URL を保存し、
    /// メインアプリが次回起動時に同期できるようにします。
    ///
    /// - Parameter url: キューイングするURL
    static func enqueue(url: String) {
        guard let defaults = UserDefaults(suiteName: appGroupId) else {
            #if DEBUG
            print("[ShareExtension] Failed to access App Group UserDefaults: \(appGroupId)")
            #endif
            return
        }

        var pending = defaults.stringArray(forKey: pendingLinksKey) ?? []

        // 重複チェック
        guard !pending.contains(url) else {
            #if DEBUG
            print("[ShareExtension] URL already in pending queue: \(url)")
            #endif
            return
        }

        pending.append(url)

        // キューサイズ上限（100件）
        if pending.count > 100 {
            pending = Array(pending.suffix(100))
        }

        defaults.set(pending, forKey: pendingLinksKey)

        #if DEBUG
        print("[ShareExtension] Enqueued pending link: \(url) (total: \(pending.count))")
        #endif
    }

    /// キューに保留中のリンクがあるか
    static func hasPendingLinks() -> Bool {
        guard let defaults = UserDefaults(suiteName: appGroupId) else { return false }
        let pending = defaults.stringArray(forKey: pendingLinksKey) ?? []
        return !pending.isEmpty
    }

    /// 保留中のリンク一覧を取得
    static func getPendingLinks() -> [String] {
        guard let defaults = UserDefaults(suiteName: appGroupId) else { return [] }
        return defaults.stringArray(forKey: pendingLinksKey) ?? []
    }

    /// 特定のリンクをキューから削除（保存成功後）
    static func dequeue(url: String) {
        guard let defaults = UserDefaults(suiteName: appGroupId) else { return }
        var pending = defaults.stringArray(forKey: pendingLinksKey) ?? []
        pending.removeAll { $0 == url }
        defaults.set(pending, forKey: pendingLinksKey)
    }

    /// キューを全てクリア
    static func clearAll() {
        guard let defaults = UserDefaults(suiteName: appGroupId) else { return }
        defaults.removeObject(forKey: pendingLinksKey)
    }
}

// MARK: - Supabase API Client

/// Supabase API との通信を担当
enum SupabaseAPIClient {

    /// Supabase URL (Info.plistから取得)
    private static var supabaseUrl: String {
        Bundle.main.object(forInfoDictionaryKey: "SUPABASE_URL") as? String ?? ""
    }

    /// Supabase Anon Key (Info.plistから取得)
    private static var supabaseAnonKey: String {
        Bundle.main.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String ?? ""
    }

    /// API リクエストのタイムアウト（秒）
    private static let requestTimeout: TimeInterval = 10.0

    /// Supabase API 経由でリンクを保存
    ///
    /// create_link_with_status RPC を呼び出してリンクを作成します。
    ///
    /// - Parameters:
    ///   - url: 保存するURL
    ///   - token: Supabase認証トークン
    ///   - metadata: OGPメタデータ（オプション）
    ///   - completion: 完了コールバック (Bool: 成功/失敗)
    static func saveLink(url: String, token: String, metadata: OGPMetadata?, completion: @escaping (Bool) -> Void) {
        guard !supabaseUrl.isEmpty, !supabaseAnonKey.isEmpty else {
            #if DEBUG
            print("[ShareExtension] Supabase configuration missing in Info.plist")
            #endif
            completion(false)
            return
        }

        let endpoint = "\(supabaseUrl)/rest/v1/rpc/create_link_with_status"

        guard let endpointURL = URL(string: endpoint) else {
            #if DEBUG
            print("[ShareExtension] Invalid Supabase URL")
            #endif
            completion(false)
            return
        }

        // リクエストボディを作成
        var body: [String: Any] = ["p_url": url]

        if let metadata = metadata {
            body["p_title"] = metadata.title ?? NSNull()
            body["p_description"] = metadata.description ?? NSNull()
            body["p_image_url"] = metadata.imageUrl ?? NSNull()
            body["p_favicon_url"] = metadata.faviconUrl ?? NSNull()
            body["p_site_name"] = metadata.siteName ?? NSNull()
        } else {
            body["p_title"] = NSNull()
            body["p_description"] = NSNull()
            body["p_image_url"] = NSNull()
            body["p_favicon_url"] = NSNull()
            body["p_site_name"] = NSNull()
        }

        #if DEBUG
        if let metadata = metadata {
            print("[ShareExtension] Saving with metadata - title: \(metadata.title ?? "nil"), siteName: \(metadata.siteName ?? "nil")")
        } else {
            print("[ShareExtension] Saving without metadata")
        }
        #endif

        guard let jsonData = try? JSONSerialization.data(withJSONObject: body) else {
            #if DEBUG
            print("[ShareExtension] Failed to serialize request body")
            #endif
            completion(false)
            return
        }

        // URLSession with timeout
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = requestTimeout
        config.timeoutIntervalForResource = requestTimeout
        let session = URLSession(configuration: config)

        var request = URLRequest(url: endpointURL)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.httpBody = jsonData

        let task = session.dataTask(with: request) { data, response, error in
            session.finishTasksAndInvalidate()

            if let error = error {
                #if DEBUG
                print("[ShareExtension] Network error: \(error)")
                #endif
                completion(false)
                return
            }

            guard let httpResponse = response as? HTTPURLResponse else {
                #if DEBUG
                print("[ShareExtension] Invalid response")
                #endif
                completion(false)
                return
            }

            if httpResponse.statusCode == 200 || httpResponse.statusCode == 201 {
                #if DEBUG
                print("[ShareExtension] Successfully saved link to Supabase")
                #endif
                completion(true)
            } else {
                #if DEBUG
                if let data = data, let responseBody = String(data: data, encoding: .utf8) {
                    print("[ShareExtension] Failed to save link. Status: \(httpResponse.statusCode), Body: \(responseBody)")
                } else {
                    print("[ShareExtension] Failed to save link. Status: \(httpResponse.statusCode)")
                }
                #endif
                completion(false)
            }
        }

        task.resume()
    }
}
