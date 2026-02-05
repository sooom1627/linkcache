import UIKit
import UniformTypeIdentifiers
import Security

/**
 * Share Extension のメインビューコントローラ
 *
 * Safari 等から URL を共有した際に表示される UI を提供し、
 * URL を Supabase API 経由で保存します。
 *
 * デザインはメインアプリ (LinkCache) のデザインシステムに準拠:
 * - カラー: slate系モノトーン
 * - 形状: rounded-2xl (16pt)
 * - アニメーション: フェード + スケール
 */
class ShareViewController: UIViewController {

    // MARK: - Design System Colors (メインアプリと統一)

    /// slate-900: プライマリダーク
    private let colorSlate900 = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1)
    /// slate-800: セカンダリダーク
    private let colorSlate800 = UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1)
    /// slate-700
    private let colorSlate700 = UIColor(red: 51/255, green: 65/255, blue: 85/255, alpha: 1)
    /// slate-400: サブテキスト
    private let colorSlate400 = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1)
    /// slate-200: ボーダー
    private let colorSlate200 = UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1)
    /// slate-100: 薄い背景
    private let colorSlate100 = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1)
    /// slate-50: ベース背景
    private let colorSlate50 = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1)
    /// emerald-600: 成功
    private let colorEmerald600 = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1)
    /// red-500: エラー
    private let colorRed500 = UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1)

    // MARK: - Localization

    /// 日本語かどうか
    private var isJapanese: Bool {
        let preferredLanguage = Locale.preferredLanguages.first ?? "en"
        return preferredLanguage.hasPrefix("ja")
    }

    /// ローカライズされた文字列を取得
    private func localized(_ key: LocalizedString) -> String {
        return isJapanese ? key.ja : key.en
    }

    /// ローカライズ用文字列定義
    private enum LocalizedString {
        case optimizingURL
        case savingURL
        case saved
        case urlNotFound
        case pleaseLogin
        case loginRequired
        case saveFailed
        case tryFromApp

        var ja: String {
            switch self {
            case .optimizingURL: return "URLを最適化中..."
            case .savingURL: return "URLを保存中..."
            case .saved: return "保存しました"
            case .urlNotFound: return "URLが見つかりません"
            case .pleaseLogin: return "ログインしてください"
            case .loginRequired: return "アプリからサインインが必要です"
            case .saveFailed: return "保存に失敗しました"
            case .tryFromApp: return "アプリから再度お試しください"
            }
        }

        var en: String {
            switch self {
            case .optimizingURL: return "Optimizing URL..."
            case .savingURL: return "Saving URL..."
            case .saved: return "Saved"
            case .urlNotFound: return "URL not found"
            case .pleaseLogin: return "Please sign in"
            case .loginRequired: return "Sign in from the app"
            case .saveFailed: return "Save failed"
            case .tryFromApp: return "Try again from the app"
            }
        }
    }

    // MARK: - Constants

    /// Supabase URL (Info.plistから取得)
    private var supabaseUrl: String {
        return Bundle.main.object(forInfoDictionaryKey: "SUPABASE_URL") as? String ?? ""
    }

    /// Supabase Anon Key (Info.plistから取得)
    private var supabaseAnonKey: String {
        return Bundle.main.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String ?? ""
    }

    /// Keychain サービス名
    /// 注意: withShareExtension.tsプラグインがこのプロパティ値を動的に置換します。
    /// 現在のKeychain検索ではService名を指定しない方式を採用しているため、
    /// この値は直接使用されていませんが、プラグイン互換性のため保持しています。
    private let keychainService = "com.sooom.linkcache.dev"

    /// Supabase セッションキー（Expo SecureStoreと同じ）
    private let supabaseSessionKey = "supabase.session"

    // MARK: - UI Elements

    /// ブラー背景
    private lazy var blurView: UIVisualEffectView = {
        let blur = UIBlurEffect(style: .systemUltraThinMaterialDark)
        let view = UIVisualEffectView(effect: blur)
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()

    /// メインコンテナ (カード)
    private lazy var containerView: UIView = {
        let view = UIView()
        view.backgroundColor = colorSlate50
        view.layer.cornerRadius = 20
        view.layer.shadowColor = UIColor.black.cgColor
        view.layer.shadowOffset = CGSize(width: 0, height: 8)
        view.layer.shadowRadius = 24
        view.layer.shadowOpacity = 0.15
        view.translatesAutoresizingMaskIntoConstraints = false
        view.alpha = 0
        view.transform = CGAffineTransform(scaleX: 0.9, y: 0.9)
        return view
    }()

    /// アイコンコンテナ
    private lazy var iconContainer: UIView = {
        let view = UIView()
        view.backgroundColor = colorSlate900
        view.layer.cornerRadius = 24
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()

    /// アイコン (チェックマーク / エクスクラメーション)
    private lazy var iconImageView: UIImageView = {
        let imageView = UIImageView()
        imageView.contentMode = .scaleAspectFit
        imageView.tintColor = .white
        imageView.translatesAutoresizingMaskIntoConstraints = false
        return imageView
    }()

    /// ローディングインジケーター
    private lazy var loadingIndicator: UIActivityIndicatorView = {
        let indicator = UIActivityIndicatorView(style: .medium)
        indicator.color = .white
        indicator.translatesAutoresizingMaskIntoConstraints = false
        indicator.hidesWhenStopped = true
        return indicator
    }()

    /// メッセージラベル
    private lazy var messageLabel: UILabel = {
        let label = UILabel()
        label.text = ""  // 初期値は空、後で設定
        label.font = .systemFont(ofSize: 16, weight: .semibold)
        label.textColor = colorSlate900
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    /// サブメッセージラベル (URL表示用)
    private lazy var subMessageLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 13, weight: .regular)
        label.textColor = colorSlate400
        label.textAlignment = .center
        label.numberOfLines = 1
        label.lineBreakMode = .byTruncatingMiddle
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        animateIn()
        processSharedContent()
    }

    // MARK: - UI Setup

    private func setupUI() {
        // ブラー背景
        view.backgroundColor = .clear
        view.addSubview(blurView)

        // カードコンテナ
        view.addSubview(containerView)
        containerView.addSubview(iconContainer)
        iconContainer.addSubview(iconImageView)
        iconContainer.addSubview(loadingIndicator)
        containerView.addSubview(messageLabel)
        containerView.addSubview(subMessageLabel)

        // 初期状態: ローディング表示
        loadingIndicator.startAnimating()
        iconImageView.isHidden = true

        NSLayoutConstraint.activate([
            // ブラー背景 - 全画面
            blurView.topAnchor.constraint(equalTo: view.topAnchor),
            blurView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            blurView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            blurView.bottomAnchor.constraint(equalTo: view.bottomAnchor),

            // コンテナカード - 中央配置
            containerView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            containerView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            containerView.widthAnchor.constraint(equalToConstant: 260),
            containerView.heightAnchor.constraint(equalToConstant: 160),

            // アイコンコンテナ - カード上部中央
            iconContainer.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
            iconContainer.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 24),
            iconContainer.widthAnchor.constraint(equalToConstant: 48),
            iconContainer.heightAnchor.constraint(equalToConstant: 48),

            // アイコン - コンテナ内中央
            iconImageView.centerXAnchor.constraint(equalTo: iconContainer.centerXAnchor),
            iconImageView.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor),
            iconImageView.widthAnchor.constraint(equalToConstant: 24),
            iconImageView.heightAnchor.constraint(equalToConstant: 24),

            // ローディング - コンテナ内中央
            loadingIndicator.centerXAnchor.constraint(equalTo: iconContainer.centerXAnchor),
            loadingIndicator.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor),

            // メッセージラベル
            messageLabel.topAnchor.constraint(equalTo: iconContainer.bottomAnchor, constant: 16),
            messageLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),
            messageLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -20),

            // サブメッセージラベル
            subMessageLabel.topAnchor.constraint(equalTo: messageLabel.bottomAnchor, constant: 4),
            subMessageLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),
            subMessageLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -20),
        ])

        // タップで閉じる
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap))
        blurView.addGestureRecognizer(tapGesture)
    }

    // MARK: - Animations

    private func animateIn() {
        UIView.animate(
            withDuration: 0.3,
            delay: 0,
            usingSpringWithDamping: 0.8,
            initialSpringVelocity: 0.5,
            options: .curveEaseOut
        ) {
            self.containerView.alpha = 1
            self.containerView.transform = .identity
        }
    }

    private func animateOut(completion: @escaping () -> Void) {
        UIView.animate(
            withDuration: 0.2,
            delay: 0,
            options: .curveEaseIn
        ) {
            self.containerView.alpha = 0
            self.containerView.transform = CGAffineTransform(scaleX: 0.9, y: 0.9)
            self.blurView.alpha = 0
        } completion: { _ in
            completion()
        }
    }

    @objc private func handleTap() {
        animateOut {
            self.closeExtension()
        }
    }

    // MARK: - Content Processing

    private func processSharedContent() {
        // Step 1: URLを最適化中
        updateLoadingState(message: localized(.optimizingURL), url: nil)

        extractURL { [weak self] url in
            guard let self = self else { return }

            guard let url = url else {
                DispatchQueue.main.async {
                    self.showError(
                        message: self.localized(.urlNotFound),
                        subMessage: nil
                    )
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) {
                        self.animateOut { self.closeExtension() }
                    }
                }
                return
            }

            // Step 2: URLを保存中 (URLも表示)
            DispatchQueue.main.async {
                self.updateLoadingState(
                    message: self.localized(.savingURL),
                    url: url
                )
            }

            // Keychain からトークン取得
            guard let token = self.getSupabaseToken() else {
                DispatchQueue.main.async {
                    self.showError(
                        message: self.localized(.pleaseLogin),
                        subMessage: self.localized(.loginRequired)
                    )
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                        self.animateOut { self.closeExtension() }
                    }
                }
                return
            }

            // Supabase に保存
            self.saveToSupabase(url: url, token: token) { success in
                DispatchQueue.main.async {
                    if success {
                        self.showSuccess(url: url)
                        // 成功時は自動で閉じる
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                            self.animateOut { self.closeExtension() }
                        }
                    } else {
                        self.showError(
                            message: self.localized(.saveFailed),
                            subMessage: self.localized(.tryFromApp)
                        )
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                            self.animateOut { self.closeExtension() }
                        }
                    }
                }
            }
        }
    }

    /// ローディング状態を更新
    private func updateLoadingState(message: String, url: String?) {
        messageLabel.text = message
        if let url = url {
            subMessageLabel.text = formatURLForDisplay(url)
        }
    }

    /// URLを表示用にフォーマット
    private func formatURLForDisplay(_ url: String) -> String {
        guard let urlObj = URL(string: url),
              let host = urlObj.host else {
            return url
        }
        // ホスト名のみ表示 (www.を除去)
        return host.replacingOccurrences(of: "www.", with: "")
    }

    private func showSuccess(url: String) {
        loadingIndicator.stopAnimating()
        iconImageView.isHidden = false

        // チェックマークアイコン (SF Symbols)
        let config = UIImage.SymbolConfiguration(pointSize: 20, weight: .semibold)
        iconImageView.image = UIImage(systemName: "checkmark", withConfiguration: config)

        // 成功カラー
        iconContainer.backgroundColor = colorEmerald600

        messageLabel.text = localized(.saved)
        messageLabel.textColor = colorSlate900
        subMessageLabel.text = formatURLForDisplay(url)

        // 成功アニメーション (アイコンがポップ)
        iconContainer.transform = CGAffineTransform(scaleX: 0.8, y: 0.8)
        UIView.animate(
            withDuration: 0.4,
            delay: 0,
            usingSpringWithDamping: 0.5,
            initialSpringVelocity: 0.8,
            options: .curveEaseOut
        ) {
            self.iconContainer.transform = .identity
        }
    }

    private func showError(message: String, subMessage: String?) {
        loadingIndicator.stopAnimating()
        iconImageView.isHidden = false

        // エクスクラメーションアイコン (SF Symbols)
        let config = UIImage.SymbolConfiguration(pointSize: 20, weight: .semibold)
        iconImageView.image = UIImage(systemName: "exclamationmark", withConfiguration: config)

        // エラーカラー
        iconContainer.backgroundColor = colorRed500

        messageLabel.text = message
        messageLabel.textColor = colorSlate900
        subMessageLabel.text = subMessage ?? ""

        // エラーアニメーション (シェイク)
        let animation = CAKeyframeAnimation(keyPath: "transform.translation.x")
        animation.timingFunction = CAMediaTimingFunction(name: .linear)
        animation.duration = 0.4
        animation.values = [-8, 8, -6, 6, -4, 4, 0]
        iconContainer.layer.add(animation, forKey: "shake")
    }

    private func closeExtension() {
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
                    attachment.loadItem(forTypeIdentifier: UTType.url.identifier, options: [:]) { (data, error) in
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
                    attachment.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: [:]) { [weak self] (data, error) in
                        guard let self = self else {
                            completion(nil)
                            return
                        }
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
     *
     * 注意: Service名を指定せず、Account名のみで検索することで、
     * Expo SecureStoreが使用するService名に関係なく検索できます。
     */
    private func getSupabaseToken() -> String? {
        // Keychainクエリを作成
        // Service名を指定しないことで、Expo SecureStoreが使用するService名に関係なく検索可能
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            // kSecAttrServiceは指定しない（Account名のみで検索）
            kSecAttrAccount as String: supabaseSessionKey,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        // デバッグ: 検索パラメータを出力
        print("[ShareExtension] Attempting to retrieve token from Keychain")
        print("[ShareExtension] Account: \(supabaseSessionKey)")
        print("[ShareExtension] Service: (not specified - searching by account only)")
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        // デバッグ: Keychainアクセスの結果を出力
        print("[ShareExtension] Keychain access status: \(status)")
        if status != errSecSuccess {
            print("[ShareExtension] Keychain error code: \(status)")
            if status == errSecItemNotFound {
                print("[ShareExtension] Token not found in Keychain (errSecItemNotFound)")
            } else if status == errSecAuthFailed {
                print("[ShareExtension] Keychain access denied (errSecAuthFailed)")
            } else {
                print("[ShareExtension] Keychain access failed with error: \(status)")
            }
        }
        
        guard status == errSecSuccess,
              let data = result as? Data,
              let jsonString = String(data: data, encoding: .utf8) else {
            print("[ShareExtension] Failed to retrieve Supabase token from Keychain")
            return nil
        }
        
        // デバッグ: 取得したデータのサイズを出力
        print("[ShareExtension] Retrieved data from Keychain: \(data.count) bytes")
        
        // JSON をパースして access_token を取得
        do {
            if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
               let accessToken = json["access_token"] as? String {
                print("[ShareExtension] Successfully retrieved Supabase token")
                print("[ShareExtension] Token length: \(accessToken.count) characters")
                return accessToken
            } else {
                print("[ShareExtension] Failed to parse access_token from JSON")
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    print("[ShareExtension] JSON keys: \(json.keys)")
                }
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
            "p_title": NSNull(),
            "p_description": NSNull(),
            "p_image_url": NSNull(),
            "p_favicon_url": NSNull(),
            "p_site_name": NSNull()
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
