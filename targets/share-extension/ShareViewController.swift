import UIKit
import UniformTypeIdentifiers

/**
 * Share Extension のメインビューコントローラ
 *
 * Safari 等から URL を共有した際に表示される UI を提供し、
 * URL を App Group に保存してメインアプリに引き継ぎます。
 */
class ShareViewController: UIViewController {

    // MARK: - Constants

    /// App Group ID (開発環境)
    /// 本番環境では group.com.sooom.linkcache を使用
    private let appGroupId = "group.com.sooom.linkcache.dev"

    /// 共有アイテム保存ディレクトリ名
    private let sharedItemsDirectory = "SharedItems"

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

            DispatchQueue.main.async {
                if let url = url {
                    // URL の保存を試みる
                    let success = self.saveToAppGroup(url: url)

                    if success {
                        // 成功: 緑の背景で「保存しました」
                        self.showSuccess()
                    } else {
                        // 保存失敗
                        self.showError(message: "保存に失敗しました")
                    }
                } else {
                    // URL 取得失敗
                    self.showError(message: "URLを取得できませんでした")
                }

                // 1.5 秒後に自動で閉じる
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                    self.close()
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

    // MARK: - App Group Storage

    @discardableResult
    private func saveToAppGroup(url: String) -> Bool {
        guard let containerURL = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: appGroupId
        ) else {
            print("[ShareExtension] Failed to access App Group container")
            return false
        }

        let sharedItemsURL = containerURL.appendingPathComponent(sharedItemsDirectory, isDirectory: true)

        // SharedItems ディレクトリを作成 (存在しない場合)
        do {
            try FileManager.default.createDirectory(
                at: sharedItemsURL,
                withIntermediateDirectories: true,
                attributes: nil
            )
        } catch {
            print("[ShareExtension] Failed to create SharedItems directory: \(error)")
            return false
        }

        // 共有アイテムデータを作成
        let id = UUID().uuidString
        let createdAt = ISO8601DateFormatter().string(from: Date())

        let sharedItem: [String: Any] = [
            "id": id,
            "url": url,
            "createdAt": createdAt
        ]

        // JSON ファイルとして保存
        let fileURL = sharedItemsURL.appendingPathComponent("\(id).json")

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: sharedItem, options: .prettyPrinted)
            try jsonData.write(to: fileURL)
            print("[ShareExtension] Saved shared item: \(id)")
            return true
        } catch {
            print("[ShareExtension] Failed to save shared item: \(error)")
            return false
        }
    }
}
