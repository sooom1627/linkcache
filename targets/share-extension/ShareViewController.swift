import UIKit
import UniformTypeIdentifiers

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

    private enum Colors {
        static let slate900 = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1)
        static let slate500 = UIColor(red: 107/255, green: 114/255, blue: 128/255, alpha: 1)
        static let slate400 = UIColor(red: 148/255, green: 163/255, blue: 184/255, alpha: 1)
        static let slate50  = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1)
        static let emerald600 = UIColor(red: 5/255, green: 150/255, blue: 105/255, alpha: 1)
        static let red500 = UIColor(red: 239/255, green: 68/255, blue: 68/255, alpha: 1)
    }

    // MARK: - Layout Constants

    private enum Layout {
        static let cardWidth: CGFloat = 260
        static let cardHeight: CGFloat = 160
        static let cardCornerRadius: CGFloat = 20
        static let cardShadowRadius: CGFloat = 24
        static let cardShadowOpacity: Float = 0.15
        static let cardShadowOffsetY: CGFloat = 8
        static let cardPadding: CGFloat = 20
        static let iconContainerSize: CGFloat = 48
        static let iconContainerCornerRadius: CGFloat = 24
        static let iconSize: CGFloat = 24
        static let iconTopPadding: CGFloat = 24
        static let iconSymbolSize: CGFloat = 20
        static let messageFontSize: CGFloat = 16
        static let subMessageFontSize: CGFloat = 13
        static let messageTopSpacing: CGFloat = 16
        static let subMessageTopSpacing: CGFloat = 4
    }

    // MARK: - Animation Constants

    private enum Anim {
        static let appearDuration: TimeInterval = 0.3
        static let appearDamping: CGFloat = 0.8
        static let appearVelocity: CGFloat = 0.5
        static let disappearDuration: TimeInterval = 0.2
        static let scaleDown: CGFloat = 0.9
        static let successPopDuration: TimeInterval = 0.4
        static let successPopDamping: CGFloat = 0.5
        static let successPopVelocity: CGFloat = 0.8
        static let successPopScale: CGFloat = 0.8
        static let shakeDuration: CFTimeInterval = 0.4
        static let shakeValues: [NSNumber] = [-8, 8, -6, 6, -4, 4, 0]
        static let successDismissDelay: TimeInterval = 1.2
        static let errorDismissDelay: TimeInterval = 2.0
        static let urlNotFoundDismissDelay: TimeInterval = 1.8
        /// 各ステップの最小表示時間（UX向上のため）
        static let minimumStepDuration: TimeInterval = 1.0
    }

    // MARK: - Localization

    private var isJapanese: Bool {
        let preferredLanguage = Locale.preferredLanguages.first ?? "en"
        return preferredLanguage.hasPrefix("ja")
    }

    private func localized(_ key: LocalizedString) -> String {
        return isJapanese ? key.ja : key.en
    }

    private enum LocalizedString {
        case optimizingURL
        case loadingLink
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
            case .loadingLink: return "リンクを読み込み中..."
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
            case .loadingLink: return "Loading link..."
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

    // MARK: - UI Elements

    private lazy var blurView: UIVisualEffectView = {
        let blur = UIBlurEffect(style: .systemUltraThinMaterialDark)
        let view = UIVisualEffectView(effect: blur)
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()

    private lazy var containerView: UIView = {
        let view = UIView()
        view.backgroundColor = Colors.slate50
        view.layer.cornerRadius = Layout.cardCornerRadius
        view.layer.shadowColor = UIColor.black.cgColor
        view.layer.shadowOffset = CGSize(width: 0, height: Layout.cardShadowOffsetY)
        view.layer.shadowRadius = Layout.cardShadowRadius
        view.layer.shadowOpacity = Layout.cardShadowOpacity
        view.translatesAutoresizingMaskIntoConstraints = false
        view.alpha = 0
        view.transform = CGAffineTransform(scaleX: Anim.scaleDown, y: Anim.scaleDown)
        return view
    }()

    private lazy var iconContainer: UIView = {
        let view = UIView()
        view.backgroundColor = Colors.slate900
        view.layer.cornerRadius = Layout.iconContainerCornerRadius
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()

    private lazy var iconImageView: UIImageView = {
        let imageView = UIImageView()
        imageView.contentMode = .scaleAspectFit
        imageView.tintColor = .white
        imageView.translatesAutoresizingMaskIntoConstraints = false
        return imageView
    }()

    private lazy var loadingIndicator: UIActivityIndicatorView = {
        let indicator = UIActivityIndicatorView(style: .medium)
        indicator.color = Colors.slate500
        indicator.translatesAutoresizingMaskIntoConstraints = false
        indicator.hidesWhenStopped = true
        return indicator
    }()

    private lazy var messageLabel: UILabel = {
        let label = UILabel()
        label.text = ""
        label.font = .systemFont(ofSize: Layout.messageFontSize, weight: .semibold)
        label.textColor = Colors.slate900
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    private lazy var subMessageLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: Layout.subMessageFontSize, weight: .regular)
        label.textColor = Colors.slate400
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
        view.backgroundColor = .clear
        view.addSubview(blurView)

        view.addSubview(containerView)
        containerView.addSubview(iconContainer)
        iconContainer.addSubview(iconImageView)
        iconContainer.addSubview(loadingIndicator)
        containerView.addSubview(messageLabel)
        containerView.addSubview(subMessageLabel)

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
            containerView.widthAnchor.constraint(equalToConstant: Layout.cardWidth),
            containerView.heightAnchor.constraint(equalToConstant: Layout.cardHeight),

            // アイコンコンテナ - カード上部中央
            iconContainer.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
            iconContainer.topAnchor.constraint(equalTo: containerView.topAnchor, constant: Layout.iconTopPadding),
            iconContainer.widthAnchor.constraint(equalToConstant: Layout.iconContainerSize),
            iconContainer.heightAnchor.constraint(equalToConstant: Layout.iconContainerSize),

            // アイコン - コンテナ内中央
            iconImageView.centerXAnchor.constraint(equalTo: iconContainer.centerXAnchor),
            iconImageView.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor),
            iconImageView.widthAnchor.constraint(equalToConstant: Layout.iconSize),
            iconImageView.heightAnchor.constraint(equalToConstant: Layout.iconSize),

            // ローディング - コンテナ内中央
            loadingIndicator.centerXAnchor.constraint(equalTo: iconContainer.centerXAnchor),
            loadingIndicator.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor),

            // メッセージラベル
            messageLabel.topAnchor.constraint(equalTo: iconContainer.bottomAnchor, constant: Layout.messageTopSpacing),
            messageLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: Layout.cardPadding),
            messageLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -Layout.cardPadding),

            // サブメッセージラベル
            subMessageLabel.topAnchor.constraint(equalTo: messageLabel.bottomAnchor, constant: Layout.subMessageTopSpacing),
            subMessageLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: Layout.cardPadding),
            subMessageLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -Layout.cardPadding),
        ])

        // タップで閉じる
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap))
        blurView.addGestureRecognizer(tapGesture)
    }

    // MARK: - Animations

    private func animateIn() {
        UIView.animate(
            withDuration: Anim.appearDuration,
            delay: 0,
            usingSpringWithDamping: Anim.appearDamping,
            initialSpringVelocity: Anim.appearVelocity,
            options: .curveEaseOut
        ) {
            self.containerView.alpha = 1
            self.containerView.transform = .identity
        }
    }

    private func animateOut(completion: @escaping () -> Void) {
        UIView.animate(
            withDuration: Anim.disappearDuration,
            delay: 0,
            options: .curveEaseIn
        ) {
            self.containerView.alpha = 0
            self.containerView.transform = CGAffineTransform(scaleX: Anim.scaleDown, y: Anim.scaleDown)
            self.blurView.alpha = 0
        } completion: { _ in
            completion()
        }
    }

    @objc private func handleTap() {
        animateOut { [weak self] in
            self?.closeExtension()
        }
    }

    // MARK: - Content Processing

    private func processSharedContent() {
        let step1StartTime = Date()
        updateLoadingState(message: localized(.optimizingURL), url: nil)

        extractURL { [weak self] url in
            guard let self = self else { return }

            guard let url = url else {
                DispatchQueue.main.async { [weak self] in
                    guard let self = self else { return }
                    self.showError(message: self.localized(.urlNotFound), subMessage: nil)
                    DispatchQueue.main.asyncAfter(deadline: .now() + Anim.urlNotFoundDismissDelay) { [weak self] in
                        self?.animateOut { self?.closeExtension() }
                    }
                }
                return
            }

            // Step 1完了 - 最小表示時間を確保してからStep 2へ
            let step1Elapsed = Date().timeIntervalSince(step1StartTime)
            let step1Delay = max(0, Anim.minimumStepDuration - step1Elapsed)

            DispatchQueue.main.asyncAfter(deadline: .now() + step1Delay) { [weak self] in
                guard let self = self else { return }

                // Step 2: リンクを読み込み中 (OGPメタデータ取得)
                let step2StartTime = Date()
                self.updateLoadingState(message: self.localized(.loadingLink), url: url)

                // Keychain からトークン取得（認証エラーは早めに検出）
                guard let token = KeychainService.getSupabaseToken() else {
                    self.showError(
                        message: self.localized(.pleaseLogin),
                        subMessage: self.localized(.loginRequired)
                    )
                    DispatchQueue.main.asyncAfter(deadline: .now() + Anim.errorDismissDelay) { [weak self] in
                        self?.animateOut { self?.closeExtension() }
                    }
                    return
                }

                // Step 3: OGPメタデータを取得
                OGPMetadataFetcher.fetch(url: url) { [weak self] metadata in
                    guard let self = self else { return }

                    // Step 2完了 - 最小表示時間を確保してからStep 3へ
                    let step2Elapsed = Date().timeIntervalSince(step2StartTime)
                    let step2Delay = max(0, Anim.minimumStepDuration - step2Elapsed)

                    DispatchQueue.main.asyncAfter(deadline: .now() + step2Delay) { [weak self] in
                        guard let self = self else { return }

                        // Step 4: URLを保存中
                        let step3StartTime = Date()
                        self.updateLoadingState(message: self.localized(.savingURL), url: url)

                        // Step 5: Supabase に保存（メタデータあり/なし両対応）
                        SupabaseAPIClient.saveLink(url: url, token: token, metadata: metadata) { [weak self] success in
                            guard let self = self else { return }

                            // Step 3完了 - 最小表示時間を確保してからStep 4へ
                            let step3Elapsed = Date().timeIntervalSince(step3StartTime)
                            let step3Delay = max(0, Anim.minimumStepDuration - step3Elapsed)

                            DispatchQueue.main.asyncAfter(deadline: .now() + step3Delay) { [weak self] in
                                guard let self = self else { return }

                                if success {
                                    self.showSuccess(url: url)
                                    DispatchQueue.main.asyncAfter(deadline: .now() + Anim.successDismissDelay) { [weak self] in
                                        self?.animateOut { self?.closeExtension() }
                                    }
                                } else {
                                    self.showError(
                                        message: self.localized(.saveFailed),
                                        subMessage: self.localized(.tryFromApp)
                                    )
                                    DispatchQueue.main.asyncAfter(deadline: .now() + Anim.errorDismissDelay) { [weak self] in
                                        self?.animateOut { self?.closeExtension() }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // MARK: - UI State Updates

    private func updateLoadingState(message: String, url: String?) {
        messageLabel.text = message
        if let url = url {
            subMessageLabel.text = formatURLForDisplay(url)
        }
    }

    private func formatURLForDisplay(_ url: String) -> String {
        guard let urlObj = URL(string: url),
              let host = urlObj.host else {
            return url
        }
        return host.replacingOccurrences(of: "www.", with: "")
    }

    private func showSuccess(url: String) {
        loadingIndicator.stopAnimating()
        iconImageView.isHidden = false

        let config = UIImage.SymbolConfiguration(pointSize: Layout.iconSymbolSize, weight: .semibold)
        iconImageView.image = UIImage(systemName: "checkmark", withConfiguration: config)
        iconContainer.backgroundColor = Colors.emerald600

        messageLabel.text = localized(.saved)
        messageLabel.textColor = Colors.slate900
        subMessageLabel.text = formatURLForDisplay(url)

        // 成功アニメーション (アイコンがポップ)
        iconContainer.transform = CGAffineTransform(scaleX: Anim.successPopScale, y: Anim.successPopScale)
        UIView.animate(
            withDuration: Anim.successPopDuration,
            delay: 0,
            usingSpringWithDamping: Anim.successPopDamping,
            initialSpringVelocity: Anim.successPopVelocity,
            options: .curveEaseOut
        ) {
            self.iconContainer.transform = .identity
        }
    }

    private func showError(message: String, subMessage: String?) {
        loadingIndicator.stopAnimating()
        iconImageView.isHidden = false

        let config = UIImage.SymbolConfiguration(pointSize: Layout.iconSymbolSize, weight: .semibold)
        iconImageView.image = UIImage(systemName: "exclamationmark", withConfiguration: config)
        iconContainer.backgroundColor = Colors.red500

        messageLabel.text = message
        messageLabel.textColor = Colors.slate900
        subMessageLabel.text = subMessage ?? ""

        // エラーアニメーション (シェイク)
        let animation = CAKeyframeAnimation(keyPath: "transform.translation.x")
        animation.timingFunction = CAMediaTimingFunction(name: .linear)
        animation.duration = Anim.shakeDuration
        animation.values = Anim.shakeValues
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
                    attachment.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: [:]) { (data, error) in
                        if let text = data as? String, Self.isValidURL(text) {
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

    private static func isValidURL(_ string: String) -> Bool {
        guard let url = URL(string: string) else { return false }
        return url.scheme == "http" || url.scheme == "https"
    }
}
