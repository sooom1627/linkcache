import UIKit
import UniformTypeIdentifiers
import Security

/**
 * Share Extension のメインビューコントローラ
 *
 * Safari 等から URL を共有した際に表示される UI を提供し、
 * URL を Supabase API 経由で保存します。
 */
class ShareViewController: UIViewController {

    // MARK: - Constants

    /// Supabase URL (Info.plistから取得)
    private var supabaseUrl: String {
        return Bundle.main.object(forInfoDictionaryKey: "SUPABASE_URL") as? String ?? ""
    }

    /// Supabase Anon Key (Info.plistから取得)
    private var supabaseAnonKey: String {
        return Bundle.main.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String ?? ""
    }
    
    /// Keychain サービス名（Expo SecureStoreと同じ）
    private let keychainService = "com.sooom.linkcache.dev"
    
    /// Supabase セッションキー（Expo SecureStoreと同じ）
    private let supabaseSessionKey = "supabase.session"

    // MARK: - UI Elements

    /// 保存完了メッセージラベル
    private let savedLabel: UILabel = {
        let label = UILabel()
        label.text = "保存しました"
        label.font = .systemFont(ofSize: 17, weight: .medium)
        label.textColor = .white
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    /// 背景コンテナビュー
    private let containerView: UIView = {
        let view = UIView()
        view.backgroundColor = UIColor.systemGreen
        view.layer.cornerRadius = 12
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()

    /// エラーメッセージラベル
    private let errorLabel: UILabel = {
        let label = UILabel()
        label.text = "URLを取得できませんでした"
        label.font = .systemFont(ofSize: 15, weight: .regular)
        label.textColor = .white
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        label.isHidden = true
        return label
    }()

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        processSharedContent()
    }

    // MARK: - UI Setup

    private func setupUI() {
        // 半透明の背景
        view.backgroundColor = UIColor.black.withAlphaComponent(0.4)

        view.addSubview(containerView)
        containerView.addSubview(savedLabel)
        containerView.addSubview(errorLabel)

        NSLayoutConstraint.activate([
            // コンテナを中央に配置
            containerView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            containerView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            containerView.widthAnchor.constraint(equalToConstant: 200),
            containerView.heightAnchor.constraint(equalToConstant: 80),

            // ラベルをコンテナ内で中央に配置
            savedLabel.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
            savedLabel.centerYAnchor.constraint(equalTo: containerView.centerYAnchor),

            errorLabel.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
            errorLabel.centerYAnchor.constraint(equalTo: containerView.centerYAnchor),
        ])

        // タップで閉じる
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap))
        view.addGestureRecognizer(tapGesture)
    }

    @objc private func handleTap() {
        close()
    }

    // MARK: - Content Processing

    private func processSharedContent() {
        extractURL { [weak self] url in
            guard let self = self else { return }

            guard let url = url else {
                DispatchQueue.main.async {
                    self.showError(message: "URLを取得できませんでした")
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                        self.close()
                    }
                }
                return
            }
            
            // Keychain からトークン取得
            guard let token = self.getSupabaseToken() else {
                DispatchQueue.main.async {
                    self.showError(message: "ログインしてください")
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                        self.close()
                    }
                }
                return
            }
            
            // Supabase に保存
            self.saveToSupabase(url: url, token: token) { success in
                DispatchQueue.main.async {
                    if success {
                        self.showSuccess()
                    } else {
                        self.showError(message: "保存に失敗しました")
                    }
                    
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                        self.close()
                    }
                }
            }
        }
    }

    private func showSuccess() {
        savedLabel.isHidden = false
        errorLabel.isHidden = true
        containerView.backgroundColor = .systemGreen
    }

    private func showError(message: String) {
        savedLabel.isHidden = true
        errorLabel.text = message
        errorLabel.isHidden = false
        containerView.backgroundColor = .systemRed
    }

    private func close() {
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }

    // MARK: - URL Extraction

    private func extractURL(completion: @escaping (String?) -> Void) {
        guard let inputItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            completion(nil)
            return
        }

        for item in inputItems {
            guard let attachments = item.attachments else { continue }

            for attachment in attachments {
                // URL タイプを確認
                if attachment.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    attachment.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { (data, error) in
                        if let url = data as? URL {
                            completion(url.absoluteString)
                        } else if let urlString = data as? String {
                            completion(urlString)
                        } else {
                            completion(nil)
                        }
                    }
                    return
                }

                // プレーンテキストとして URL が渡される場合もある
                if attachment.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                    attachment.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { (data, error) in
                        if let text = data as? String, self.isValidURL(text) {
                            completion(text)
                        } else {
                            completion(nil)
                        }
                    }
                    return
                }
            }
        }

        completion(nil)
    }

    private func isValidURL(_ string: String) -> Bool {
        guard let url = URL(string: string) else { return false }
        return url.scheme == "http" || url.scheme == "https"
    }

    // MARK: - Keychain Access
    
    /**
     * Keychain から Supabase セッショントークンを取得
     *
     * Expo SecureStore と同じ Keychain Access Group を使用して、
     * メインアプリで保存された認証トークンを読み取ります。
     */
    private func getSupabaseToken() -> String? {
        // Keychainクエリを作成
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: supabaseSessionKey,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess,
              let data = result as? Data,
              let jsonString = String(data: data, encoding: .utf8) else {
            print("[ShareExtension] Failed to retrieve Supabase token from Keychain")
            return nil
        }
        
        // JSON をパースして access_token を取得
        do {
            if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
               let accessToken = json["access_token"] as? String {
                print("[ShareExtension] Successfully retrieved Supabase token")
                return accessToken
            }
        } catch {
            print("[ShareExtension] Failed to parse Supabase session: \(error)")
        }
        
        return nil
    }
    
    // MARK: - Supabase API
    
    /**
     * Supabase API 経由でリンクを保存
     *
     * create_link_with_status RPC を呼び出してリンクを作成します。
     */
    private func saveToSupabase(url: String, token: String, completion: @escaping (Bool) -> Void) {
        // エンドポイント URL を作成
        let endpoint = "\(supabaseUrl)/rest/v1/rpc/create_link_with_status"
        
        guard let endpointURL = URL(string: endpoint) else {
            print("[ShareExtension] Invalid Supabase URL")
            completion(false)
            return
        }
        
        // リクエストボディを作成
        let body: [String: Any] = [
            "p_url": url,
            "p_title": nil as Any,
            "p_description": nil as Any,
            "p_image_url": nil as Any,
            "p_favicon_url": nil as Any,
            "p_site_name": nil as Any
        ]
        
        guard let jsonData = try? JSONSerialization.data(withJSONObject: body) else {
            print("[ShareExtension] Failed to serialize request body")
            completion(false)
            return
        }
        
        // HTTP リクエストを作成
        var request = URLRequest(url: endpointURL)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.httpBody = jsonData
        
        // リクエストを送信
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("[ShareExtension] Network error: \(error)")
                completion(false)
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                print("[ShareExtension] Invalid response")
                completion(false)
                return
            }
            
            if httpResponse.statusCode == 200 || httpResponse.statusCode == 201 {
                print("[ShareExtension] Successfully saved link to Supabase")
                completion(true)
            } else {
                if let data = data, let responseBody = String(data: data, encoding: .utf8) {
                    print("[ShareExtension] Failed to save link. Status: \(httpResponse.statusCode), Body: \(responseBody)")
                } else {
                    print("[ShareExtension] Failed to save link. Status: \(httpResponse.statusCode)")
                }
                completion(false)
            }
        }
        
        task.resume()
    }
}
