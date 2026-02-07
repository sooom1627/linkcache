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

    /// Keychainから Supabase セッショントークンを取得
    ///
    /// Expo SecureStore と同じ Keychain Access Group を使用して、
    /// メインアプリで保存された認証トークンを読み取ります。
    /// トークンの有効期限もチェックし、期限切れの場合は nil を返します。
    ///
    /// - Returns: 有効な access_token、取得失敗または期限切れの場合は nil
    static func getSupabaseToken() -> String? {
        // Service名を指定しないことで、Expo SecureStoreが使用するService名に関係なく検索可能
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

        // JSON をパースして access_token を取得
        do {
            guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let accessToken = json["access_token"] as? String else {
                #if DEBUG
                print("[ShareExtension] Failed to parse access_token from JSON")
                #endif
                return nil
            }

            // トークンの有効期限をチェック
            if let expiresAt = json["expires_at"] as? TimeInterval {
                let expirationDate = Date(timeIntervalSince1970: expiresAt)
                if expirationDate <= Date() {
                    #if DEBUG
                    print("[ShareExtension] Token expired at: \(expirationDate)")
                    #endif
                    return nil
                }
            }

            #if DEBUG
            print("[ShareExtension] Successfully retrieved Supabase token")
            #endif
            return accessToken
        } catch {
            #if DEBUG
            print("[ShareExtension] Failed to parse Supabase session: \(error)")
            #endif
            return nil
        }
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
