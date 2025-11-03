# MCP天気情報サーバー

MCPの学習用に作成した、天気情報を提供するシンプルなMCPサーバーです。

## 概要

このサーバーは、Open-Meteo API（無料、APIキー不要）を使用して日本の主要都市の現在の天気情報を取得します。

**MCPの3つの主要機能（Tools、Resources、Prompts）をすべて実装した完全な学習用サンプルです。**

## 機能

### Tools（ツール）

- **get_weather**: 指定された都市の現在の天気情報を取得
  - 対応都市: 東京、大阪、京都、福岡、札幌、名古屋、横浜、神戸、仙台、広島
  - 取得情報: 気温、天気、風速、風向、観測時刻

### Resources（リソース）

- **weather://cities**: 対応都市一覧
  - 10都市の詳細情報（ID、名前、緯度、経度）をJSON形式で提供
  - Claudeがサーバーの機能を理解するための参照データ

### Prompts（プロンプト）

- **compare-weather**: 2都市の天気比較
  - 2つの都市の天気を取得して比較するテンプレート
  - パラメータ: `city1`, `city2`（例: tokyo, osaka）

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

### Tools（ツール）の使用

Claude Desktopで以下のように質問してください：

- 「東京の天気を教えて」
- 「大阪の現在の気温は？」
- 「札幌の天気はどう？」

Claudeが自動的に`get_weather`ツールを使用して天気情報を取得します。

### Resources（リソース）の使用

- 「対応している都市を教えて」
- 「weather://citiesのリソースを見せて」

Claudeが`weather://cities`リソースを読み込んで都市一覧を表示します。

### Prompts（プロンプト）の使用

- 「compare-weatherプロンプトを使って東京と札幌を比較して」
- プロンプト一覧から`compare-weather`を選択して実行

Claudeが定型のプロンプトテンプレートを使用して2都市の天気を比較します。

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
  - `cityCoordinates`: 都市データ（共通で使用）
  - `getWeather()`: Open-Meteo APIから天気情報を取得する関数
  - **Tools**:
    - `ListToolsRequestSchema`ハンドラー: 利用可能なツールの一覧を返す
    - `CallToolRequestSchema`ハンドラー: ツールの実行を処理
  - **Resources**:
    - `ListResourcesRequestSchema`ハンドラー: 利用可能なリソースの一覧を返す
    - `ReadResourceRequestSchema`ハンドラー: リソースの内容を返す
  - **Prompts**:
    - `ListPromptsRequestSchema`ハンドラー: 利用可能なプロンプトの一覧を返す
    - `GetPromptRequestSchema`ハンドラー: プロンプトの内容を返す

## MCPの学習ポイント

このプロジェクトで学べるMCPの概念：

### 基本概念
1. **Server**: MCPサーバーの初期化と設定
2. **Capabilities**: サーバーが提供する機能の宣言（tools, resources, prompts）
3. **StdioServerTransport**: 標準入出力を使った通信
4. **JSON-RPC 2.0**: MCPの通信プロトコル

### Tools（ツール）
5. **ListToolsRequestSchema**: 利用可能なツールの一覧提供
6. **CallToolRequestSchema**: ツールの実行処理
7. **InputSchema**: パラメータ定義（JSON Schema形式）

### Resources（リソース）
8. **ListResourcesRequestSchema**: 利用可能なリソースの一覧提供
9. **ReadResourceRequestSchema**: リソースの内容読み込み
10. **URI方式**: `weather://cities`のようなカスタムURIスキーム

### Prompts（プロンプト）
11. **ListPromptsRequestSchema**: 利用可能なプロンプトの一覧提供
12. **GetPromptRequestSchema**: プロンプトテンプレートの取得
13. **動的プロンプト生成**: パラメータに基づいてプロンプトを動的に生成

## トラブルシューティング

### MCPサーバーが認識されない場合

1. Claude Desktopを完全に終了しているか確認
2. 設定ファイルのパスが正しいか確認
3. `npm install`が正常に完了しているか確認
4. Node.jsがインストールされているか確認（`node --version`）

### エラーログの確認

Claude Desktopのログを確認する方法：
- メニューから「Help」→「View Logs」を選択

## JSON-RPCでの直接テスト

MCPサーバーは標準入出力でJSON-RPCメッセージを受け取ります。以下のコマンドで直接テストできます：

```bash
# Tools一覧の取得
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node index.js

# 天気情報の取得
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_weather","arguments":{"city":"tokyo"}}}' | node index.js

# Resources一覧の取得
echo '{"jsonrpc":"2.0","id":3,"method":"resources/list"}' | node index.js

# Resourceの読み込み
echo '{"jsonrpc":"2.0","id":4,"method":"resources/read","params":{"uri":"weather://cities"}}' | node index.js

# Prompts一覧の取得
echo '{"jsonrpc":"2.0","id":5,"method":"prompts/list"}' | node index.js

# Promptの取得
echo '{"jsonrpc":"2.0","id":6,"method":"prompts/get","params":{"name":"compare-weather","arguments":{"city1":"tokyo","city2":"osaka"}}}' | node index.js
```

## 次のステップ

このサーバーをベースに、以下のような拡張が可能です：

- より多くの都市を追加
- 週間予報の取得機能を追加
- より多くのResourcesを追加（天気コード説明など）
- より多くのPromptsを追加（旅行アドバイスなど）
- 他の天気APIとの連携

## 参考リンク

- [MCP公式ドキュメント](https://modelcontextprotocol.io/)
- [Open-Meteo API](https://open-meteo.com/)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
