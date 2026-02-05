import Foundation

/// OGPメタデータの構造体
struct OGPMetadata {
    var title: String?
    var description: String?
    var imageUrl: String?
    var siteName: String?
    var faviconUrl: String?
}

/// OGPメタデータの取得・パースを担当
enum OGPMetadataFetcher {

    // MARK: - File Type Constants

    private static let documentExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"]
    private static let mediaExtensions = [".mp4", ".mp3", ".wav", ".avi", ".mov", ".webm", ".m4a", ".flac"]
    private static let videoExtensions = [".mp4", ".avi", ".mov", ".webm"]

    // MARK: - Regex Cache

    private static var regexCache: [String: NSRegularExpression] = [:]
    private static let regexCacheLock = NSLock()

    /// キャッシュされた正規表現を取得
    static func getCachedRegex(pattern: String) -> NSRegularExpression? {
        regexCacheLock.lock()
        defer { regexCacheLock.unlock() }

        if let cached = regexCache[pattern] {
            return cached
        }
        if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) {
            regexCache[pattern] = regex
            return regex
        }
        return nil
    }

    // MARK: - Public API

    /// URLからOGPメタデータを取得する
    /// - Note: completionは常にバックグラウンドスレッドで呼ばれる。呼び出し側でメインスレッドにディスパッチすること。
    static func fetch(url: String, completion: @escaping (OGPMetadata?) -> Void) {
        guard let requestURL = URL(string: url) else {
            #if DEBUG
            print("[ShareExtension] Invalid URL for OGP fetch: \(url)")
            #endif
            completion(nil)
            return
        }

        // Check if URL is a document/media file (skip OGP fetch)
        let lowercasePath = requestURL.path.lowercased()
        let allExtensions = documentExtensions + mediaExtensions

        if allExtensions.contains(where: { lowercasePath.hasSuffix($0) }) {
            completion(createDocumentMetadata(url: requestURL, lowercasePath: lowercasePath))
            return
        }

        // Create URLSession with 5 second timeout
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 5.0
        config.timeoutIntervalForResource = 5.0
        let session = URLSession(configuration: config)

        var request = URLRequest(url: requestURL)
        request.httpMethod = "GET"
        request.setValue(
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
            forHTTPHeaderField: "User-Agent"
        )
        request.setValue("ja,en-US;q=0.9,en;q=0.8", forHTTPHeaderField: "Accept-Language")
        request.setValue(
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            forHTTPHeaderField: "Accept"
        )

        let task = session.dataTask(with: request) { data, response, error in
            // URLSession を明示的に解放 (Share Extension のメモリ制限対策)
            session.finishTasksAndInvalidate()

            let fallbackMetadata = createFallbackMetadata(url: requestURL)

            if let error = error {
                #if DEBUG
                print("[ShareExtension] OGP fetch error: \(error.localizedDescription)")
                #endif
                completion(fallbackMetadata)
                return
            }

            guard let data = data, let httpResponse = response as? HTTPURLResponse else {
                #if DEBUG
                print("[ShareExtension] OGP fetch: No data or invalid response")
                #endif
                completion(fallbackMetadata)
                return
            }

            guard (200...299).contains(httpResponse.statusCode) else {
                #if DEBUG
                print("[ShareExtension] OGP fetch failed with status: \(httpResponse.statusCode)")
                #endif
                completion(fallbackMetadata)
                return
            }

            // Detect encoding and decode HTML
            let encoding = detectEncoding(from: httpResponse)
            let html = String(data: data, encoding: encoding)
                ?? String(data: data, encoding: .utf8)
                ?? String(data: data, encoding: .ascii)

            guard let htmlContent = html else {
                #if DEBUG
                print("[ShareExtension] OGP fetch: Failed to decode HTML")
                #endif
                completion(fallbackMetadata)
                return
            }

            let metadata = parseOGPMetadata(html: htmlContent, baseURL: requestURL)
            #if DEBUG
            print("[ShareExtension] OGP fetched - title: \(metadata.title ?? "nil"), siteName: \(metadata.siteName ?? "nil")")
            #endif
            completion(metadata)
        }

        task.resume()
    }

    // MARK: - Fallback Metadata

    /// URLから基本的なフォールバックメタデータを生成
    static func createFallbackMetadata(url: URL) -> OGPMetadata {
        var metadata = OGPMetadata()
        metadata.siteName = url.host?.replacingOccurrences(of: "www.", with: "")
        metadata.faviconUrl = "\(url.scheme ?? "https")://\(url.host ?? "")/favicon.ico"
        return metadata
    }

    // MARK: - Private Helpers

    /// ドキュメント/メディアファイル用のメタデータを生成
    private static func createDocumentMetadata(url: URL, lowercasePath: String) -> OGPMetadata {
        var metadata = createFallbackMetadata(url: url)

        let filename = url.lastPathComponent
        let nameWithoutExtension = (filename as NSString).deletingPathExtension
        if let decodedName = nameWithoutExtension.removingPercentEncoding {
            metadata.title = decodedName.isEmpty ? metadata.siteName : decodedName
        } else {
            metadata.title = nameWithoutExtension.isEmpty ? metadata.siteName : nameWithoutExtension
        }

        if lowercasePath.hasSuffix(".pdf") {
            metadata.description = "PDF Document"
        } else if documentExtensions.contains(where: { lowercasePath.hasSuffix($0) }) {
            metadata.description = "Document"
        } else if videoExtensions.contains(where: { lowercasePath.hasSuffix($0) }) {
            metadata.description = "Video"
        } else {
            metadata.description = "Audio"
        }

        return metadata
    }

    /// Content-Typeヘッダーからエンコーディングを検出
    private static func detectEncoding(from response: HTTPURLResponse) -> String.Encoding {
        guard let contentType = response.value(forHTTPHeaderField: "Content-Type") else {
            return .utf8
        }
        let lowercaseContentType = contentType.lowercased()
        if lowercaseContentType.contains("charset=shift_jis") ||
           lowercaseContentType.contains("charset=shift-jis") {
            return .shiftJIS
        } else if lowercaseContentType.contains("charset=euc-jp") {
            return .japaneseEUC
        } else if lowercaseContentType.contains("charset=iso-2022-jp") {
            return .iso2022JP
        }
        return .utf8
    }

    /// 相対URLを絶対URLに変換する
    private static func resolveURL(_ urlString: String, baseURL: URL) -> String? {
        if urlString.hasPrefix("http://") || urlString.hasPrefix("https://") {
            return urlString
        }

        if urlString.hasPrefix("//") {
            return "\(baseURL.scheme ?? "https"):\(urlString)"
        }

        if urlString.hasPrefix("/") {
            guard let scheme = baseURL.scheme, let host = baseURL.host else { return nil }
            let port = baseURL.port.map { ":\($0)" } ?? ""
            return "\(scheme)://\(host)\(port)\(urlString)"
        }

        guard var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false) else {
            return nil
        }

        var path = baseURL.path
        if !path.hasSuffix("/") {
            path = (path as NSString).deletingLastPathComponent
        }
        if !path.hasSuffix("/") {
            path += "/"
        }

        components.path = path + urlString
        return components.url?.absoluteString
    }

    // MARK: - OGP Parsing

    /// HTMLからOGPメタデータをパースする
    private static func parseOGPMetadata(html: String, baseURL: URL) -> OGPMetadata {
        var metadata = OGPMetadata()

        func extractMetaContent(property: String) -> String? {
            let patterns = [
                "<meta[^>]+property\\s*=\\s*[\"']\(property)[\"'][^>]+content\\s*=\\s*[\"']([^\"']*)[\"']",
                "<meta[^>]+content\\s*=\\s*[\"']([^\"']*)[\"'][^>]+property\\s*=\\s*[\"']\(property)[\"']",
                "<meta[^>]+name\\s*=\\s*[\"']\(property)[\"'][^>]+content\\s*=\\s*[\"']([^\"']*)[\"']",
                "<meta[^>]+content\\s*=\\s*[\"']([^\"']*)[\"'][^>]+name\\s*=\\s*[\"']\(property)[\"']"
            ]

            for pattern in patterns {
                if let regex = getCachedRegex(pattern: pattern),
                   let match = regex.firstMatch(in: html, range: NSRange(html.startIndex..., in: html)),
                   let contentRange = Range(match.range(at: 1), in: html) {
                    return String(html[contentRange]).htmlEntityDecoded().trimmedOrNil()
                }
            }
            return nil
        }

        metadata.title = extractMetaContent(property: "og:title")
        metadata.description = extractMetaContent(property: "og:description")
        metadata.siteName = extractMetaContent(property: "og:site_name")

        if let imageUrl = extractMetaContent(property: "og:image") {
            metadata.imageUrl = resolveURL(imageUrl, baseURL: baseURL)
        }

        // Fallback: <title> tag
        if metadata.title == nil {
            let titlePattern = "<title[^>]*>([^<]*)</title>"
            if let regex = getCachedRegex(pattern: titlePattern),
               let match = regex.firstMatch(in: html, range: NSRange(html.startIndex..., in: html)),
               let titleRange = Range(match.range(at: 1), in: html) {
                metadata.title = String(html[titleRange]).htmlEntityDecoded().trimmedOrNil()
            }
        }

        // Fallback: meta description
        if metadata.description == nil {
            metadata.description = extractMetaContent(property: "description")
        }

        // Extract favicon
        let faviconPatterns = [
            "<link[^>]+rel\\s*=\\s*[\"'](?:shortcut )?icon[\"'][^>]+href\\s*=\\s*[\"']([^\"']*)[\"']",
            "<link[^>]+href\\s*=\\s*[\"']([^\"']*)[\"'][^>]+rel\\s*=\\s*[\"'](?:shortcut )?icon[\"']",
            "<link[^>]+rel\\s*=\\s*[\"']apple-touch-icon[\"'][^>]+href\\s*=\\s*[\"']([^\"']*)[\"']"
        ]

        for pattern in faviconPatterns {
            if let regex = getCachedRegex(pattern: pattern),
               let match = regex.firstMatch(in: html, range: NSRange(html.startIndex..., in: html)),
               let hrefRange = Range(match.range(at: 1), in: html) {
                if let faviconUrl = resolveURL(String(html[hrefRange]), baseURL: baseURL) {
                    metadata.faviconUrl = faviconUrl
                    break
                }
            }
        }

        // Fallback: default /favicon.ico
        if metadata.faviconUrl == nil,
           let scheme = baseURL.scheme,
           let host = baseURL.host {
            metadata.faviconUrl = "\(scheme)://\(host)/favicon.ico"
        }

        // Fallback: site name from hostname
        if metadata.siteName == nil, let host = baseURL.host {
            metadata.siteName = host.replacingOccurrences(of: "www.", with: "")
        }

        return metadata
    }
}
