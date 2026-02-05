import Foundation

// MARK: - String Extensions for HTML Processing

extension String {

    /// キャッシュされた正規表現（パフォーマンス最適化: 毎回生成しない）
    private static let decimalEntityRegex = try? NSRegularExpression(pattern: "&#([0-9]+);", options: [])
    private static let hexEntityRegex = try? NSRegularExpression(pattern: "&#[xX]([0-9a-fA-F]+);", options: [])

    /// 名前付きHTMLエンティティの辞書
    private static let namedEntities: [String: String] = [
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": "\"",
        "&apos;": "'",
        "&nbsp;": " ",
        "&ndash;": "-",
        "&mdash;": "\u{2014}",
        "&hellip;": "...",
        "&yen;": "\u{00A5}",
        "&copy;": "\u{00A9}",
        "&reg;": "\u{00AE}",
        "&trade;": "\u{2122}",
        "&lsquo;": "\u{2018}",
        "&rsquo;": "\u{2019}",
        "&ldquo;": "\u{201C}",
        "&rdquo;": "\u{201D}"
    ]

    /// HTMLエンティティをデコードする
    func htmlEntityDecoded() -> String {
        var result = self

        // Named entities
        for (entity, character) in String.namedEntities {
            result = result.replacingOccurrences(of: entity, with: character)
        }

        // Numeric entities (decimal): &#123;
        if let regex = String.decimalEntityRegex {
            let range = NSRange(result.startIndex..., in: result)
            let matches = regex.matches(in: result, range: range).reversed()
            for match in matches {
                if let codeRange = Range(match.range(at: 1), in: result),
                   let codePoint = UInt32(result[codeRange]),
                   let scalar = Unicode.Scalar(codePoint) {
                    let fullRange = Range(match.range, in: result)!
                    result.replaceSubrange(fullRange, with: String(Character(scalar)))
                }
            }
        }

        // Numeric entities (hex): &#x1F4A9;
        if let regex = String.hexEntityRegex {
            let range = NSRange(result.startIndex..., in: result)
            let matches = regex.matches(in: result, range: range).reversed()
            for match in matches {
                if let codeRange = Range(match.range(at: 1), in: result),
                   let codePoint = UInt32(result[codeRange], radix: 16),
                   let scalar = Unicode.Scalar(codePoint) {
                    let fullRange = Range(match.range, in: result)!
                    result.replaceSubrange(fullRange, with: String(Character(scalar)))
                }
            }
        }

        return result
    }

    /// 文字列をトリミングし、空の場合はnilを返す
    func trimmedOrNil() -> String? {
        let trimmed = self.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }
}
