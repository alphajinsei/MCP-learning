# MCP天気情報サーバー

MCPの学習用に作成した、天気情報を提供するシンプルなMCPサーバーです。

## 概要

このサーバーは、Open-Meteo API（無料、APIキー不要）を使用して日本の主要都市の現在の天気情報を取得します。

## 機能

- **get_weather**: 指定された都市の現在の天気情報を取得
  - 対応都市: 東京、大阪、京都、福岡、札幌、名古屋、横浜、神戸、仙台、広島
  - 取得情報: 気温、天気、風速、風向、観測時刻

## セットアップ手順

### 1. 依存関係のインストール

```bash
cd mcp-weather-server
npm install
```

### 2. Claude Desktopの設定

Claude Desktopの設定ファイルにこのMCPサーバーを追加します。

**Windows**の場合、以下のファイルを編集します：
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS**の場合、以下のファイルを編集します：
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

設定ファイルに以下を追加（パスは環境に合わせて調整してください）：

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": [
        "c:\\Users\\peinn\\OneDrive\\sandbox\\claude_code\\mcp-weather-server\\index.js"
      ]
    }
  }
}
```

### 3. Claude Desktopの再起動

設定ファイルを保存したら、Claude Desktopを完全に終了して再起動します。

## 使い方

Claude Desktopで以下のように質問してください：

- 「東京の天気を教えて」
- 「大阪の現在の気温は？」
- 「札幌の天気はどう？」

Claudeが自動的に`get_weather`ツールを使用して天気情報を取得します。

## 対応都市一覧

| 英語名 | 日本語名 |
|--------|----------|
| tokyo | 東京 |
| osaka | 大阪 |
| kyoto | 京都 |
| fukuoka | 福岡 |
| sapporo | 札幌 |
| nagoya | 名古屋 |
| yokohama | 横浜 |
| kobe | 神戸 |
| sendai | 仙台 |
| hiroshima | 広島 |

## コードの構造

- [index.js](index.js): MCPサーバーのメインファイル
  - `getWeather()`: Open-Meteo APIから天気情報を取得する関数
  - `ListToolsRequestSchema`ハンドラー: 利用可能なツールの一覧を返す
  - `CallToolRequestSchema`ハンドラー: ツールの実行を処理

## MCPの学習ポイント

このプロジェクトで学べるMCPの基本概念：

1. **Server**: MCPサーバーの初期化と設定
2. **Tools**: Claudeが使用できる機能の定義
3. **RequestHandler**: ツールのリスト表示と実行の処理
4. **StdioServerTransport**: 標準入出力を使った通信
5. **InputSchema**: ツールのパラメータ定義（JSON Schema形式）

## トラブルシューティング

### MCPサーバーが認識されない場合

1. Claude Desktopを完全に終了しているか確認
2. 設定ファイルのパスが正しいか確認
3. `npm install`が正常に完了しているか確認
4. Node.jsがインストールされているか確認（`node --version`）

### エラーログの確認

Claude Desktopのログを確認する方法：
- メニューから「Help」→「View Logs」を選択

## 次のステップ

このサーバーをベースに、以下のような拡張が可能です：

- より多くの都市を追加
- 週間予報の取得機能を追加
- リソース（Resource）機能で都市一覧を提供
- プロンプト（Prompt）機能で定型質問を提供
- 他の天気APIとの連携

## 参考リンク

- [MCP公式ドキュメント](https://modelcontextprotocol.io/)
- [Open-Meteo API](https://open-meteo.com/)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
