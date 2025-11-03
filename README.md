# MCP学習プロジェクト

Model Context Protocol (MCP) の学習用に作成した、2つのMCPサーバー実装のコレクションです。

## 概要

このリポジトリには、MCPの基本概念から実践的な実装までを学ぶための2つのサンプルサーバーが含まれています：

1. **天気情報サーバー** - 外部APIと連携するシンプルなMCPサーバー
2. **メモ管理サーバー** - CRUD操作を実装したステートフルなMCPサーバー

## プロジェクト構成

```
MCP/
├── mcp-weather-server/     # 天気情報取得サーバー
│   ├── index.js
│   ├── package.json
│   └── README.md
├── mcp-memo-server/        # メモ管理サーバー
│   ├── index.js
│   ├── package.json
│   ├── data/
│   │   └── memos.json
│   └── README.md
└── .mcp.json               # MCP設定ファイル
```

## 各サーバーの特徴

### 1. 天気情報サーバー

**学習レベル**: 初級〜中級

外部API（Open-Meteo）を使用して日本の主要都市の天気情報を取得するMCPサーバーです。
**MCPの3つの主要機能（Tools、Resources、Prompts）をすべて実装した完全な学習用サンプル**です。

- **Tools**: 1個（`get_weather`）
- **Resources**: 1個（`weather://cities` - 都市一覧）
- **Prompts**: 1個（`compare-weather` - 天気比較）
- 外部API連携: あり
- データ永続化: なし
- 複雑さ: 中程度

詳細は [mcp-weather-server/README.md](mcp-weather-server/README.md) を参照してください。

### 2. メモ管理サーバー

**学習レベル**: 中級

ローカルJSONファイルを使用してメモのCRUD操作を実装したステートフルなMCPサーバーです。

- 提供ツール: 4個（`create_memo`, `read_memo`, `update_memo`, `delete_memo`）
- 外部API連携: なし
- データ永続化: あり（JSON）
- 複雑さ: やや複雑

詳細は [mcp-memo-server/README.md](mcp-memo-server/README.md) を参照してください。

## セットアップ

### 前提条件

- Node.js (v16以上推奨)
- Claude Desktop または Claude Code（VSCode拡張）

### インストール手順

各サーバーディレクトリで依存関係をインストールします：

```bash
# 天気情報サーバー
cd mcp-weather-server
npm install

# メモ管理サーバー
cd ../mcp-memo-server
npm install
```

### Claude Desktopでの設定

設定ファイル（`claude_desktop_config.json`）に以下を追加：

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["path/to/mcp-weather-server/index.js"]
    },
    "memo": {
      "command": "node",
      "args": ["path/to/mcp-memo-server/index.js"]
    }
  }
}
```

### Claude Code (VSCode) での設定

プロジェクトルートの `.mcp.json` をそのまま使用できます。

## 使用例

### 天気情報の取得

```
ユーザー: 東京の天気を教えて
Claude: [天気情報を取得して表示]
```

### メモの管理

```
ユーザー: 「買い物リスト」というメモを作って
Claude: [メモを作成]

ユーザー: 全部のメモを見せて
Claude: [メモ一覧を表示]
```

## 学習のポイント

このプロジェクトを通じて以下のMCPの概念を学べます：

### 基本概念
- MCPサーバーの初期化と設定
- 機能の宣言（Capabilities）
- リクエストハンドラーの実装
- 標準入出力による通信
- JSON-RPC 2.0プロトコル

### MCPの3つの主要機能
- **Tools**: 実行可能な機能の提供
- **Resources**: 静的・動的データの提供
- **Prompts**: 定型質問テンプレートの提供

### 実践的なトピック
- 外部APIとの連携
- ファイルI/Oとデータの永続化
- エラーハンドリング
- 複数ツールの管理
- CRUD操作の実装
- カスタムURIスキームの設計
- 動的プロンプト生成

## 技術スタック

- **ランタイム**: Node.js
- **MCP SDK**: [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- **外部API**: Open-Meteo（天気情報サーバー）

## トラブルシューティング

### MCPサーバーが認識されない

1. Claude Desktop/Codeを完全に再起動
2. 設定ファイルのパスが正しいか確認
3. `npm install`が完了しているか確認
4. Node.jsのバージョンを確認（`node --version`）

### エラーログの確認方法

- **Claude Desktop**: メニュー → Help → View Logs
- **Claude Code (VSCode)**: 出力パネル → Claude Code

## 参考リンク

- [MCP公式ドキュメント](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Open-Meteo API](https://open-meteo.com/)

## ライセンス

このプロジェクトは学習目的で作成されています。自由に使用・改変してください。

## 次のステップ

このプロジェクトをベースに、以下のような拡張を試してみてください：

- リソース（Resources）機能の実装
- プロンプト（Prompts）機能の追加
- より複雑なデータ構造の管理
- データベースとの連携
- 複数のMCPサーバー間の連携
