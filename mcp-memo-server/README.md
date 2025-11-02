# MCPメモ管理サーバー

MCPの学習用に作成した、CRUD操作を実装したメモ管理MCPサーバーです。

## 概要

このサーバーは、ローカルJSONファイルを使用してメモの作成・読み込み・更新・削除を行います。

## 機能

### 提供するツール

| ツール名 | 機能 | 説明 |
|---------|------|------|
| **create_memo** | 作成 (Create) | 新しいメモを作成 |
| **read_memo** | 読み込み (Read) | 特定のメモまたは全メモを取得 |
| **update_memo** | 更新 (Update) | 既存のメモを編集 |
| **delete_memo** | 削除 (Delete) | メモを削除 |

### データ構造

メモは以下の形式で保存されます：

```json
{
  "id": "1",
  "title": "メモのタイトル",
  "content": "メモの内容",
  "createdAt": "2025-11-01T10:00:00.000Z",
  "updatedAt": "2025-11-01T10:00:00.000Z"
}
```

データファイル: `data/memos.json`

## セットアップ手順

### 1. 依存関係のインストール

```bash
cd mcp-memo-server
npm install
```

### 2. 設定の確認

プロジェクトルートの[.mcp.json](../.mcp.json)に以下が追加されていることを確認：

```json
{
  "mcpServers": {
    "memo": {
      "command": "node",
      "args": ["mcp-memo-server/index.js"]
    }
  }
}
```

### 3. VSCodeをリロード

Ctrl+Shift+P → "Developer: Reload Window"

## 使い方

### メモの作成

```
ユーザー: 「買い物リスト」というタイトルで「牛乳、卵、パン」というメモを作って
Claude: [create_memoツールを使用]
```

### メモの一覧表示

```
ユーザー: 全部のメモを見せて
Claude: [read_memoツールを使用（IDなし）]
```

### 特定のメモの表示

```
ユーザー: ID 1のメモを見せて
Claude: [read_memoツールを使用（ID指定）]
```

### メモの更新

```
ユーザー: ID 1のメモの内容を「牛乳、卵、パン、バター」に変更して
Claude: [update_memoツールを使用]
```

### メモの削除

```
ユーザー: ID 1のメモを削除して
Claude: [delete_memoツールを使用]
```

## コードの構造

- [index.js](index.js): MCPサーバーのメインファイル
  - `loadMemos()`: メモデータを読み込む
  - `saveMemos()`: メモデータを保存する
  - `createMemo()`: 新規メモ作成
  - `readMemos()`: メモ読み込み（全件または1件）
  - `updateMemo()`: メモ更新
  - `deleteMemo()`: メモ削除
  - `ListToolsRequestSchema`ハンドラー: 4つのツールを定義
  - `CallToolRequestSchema`ハンドラー: ツール実行をswitch文で分岐

## MCPの学習ポイント

このプロジェクトで学べるMCPの概念：

1. **複数ツールの実装**: 1つのサーバーで複数の機能を提供
2. **ファイルI/O**: データの永続化とファイル操作
3. **エラーハンドリング**: ファイル不存在、ID不一致などの処理
4. **IDの自動生成**: ユニークIDの管理
5. **部分更新**: オプショナルパラメータの処理
6. **CRUD操作**: 基本的なデータ管理パターン

## 天気サーバーとの比較

| 特徴 | 天気サーバー | メモ管理サーバー |
|------|------------|----------------|
| ツール数 | 1個 | 4個 |
| 外部API | ✅ あり | ❌ なし |
| データ保存 | ❌ なし | ✅ あり (JSON) |
| 状態管理 | ステートレス | ステートフル |
| 複雑さ | シンプル | やや複雑 |

## トラブルシューティング

### データファイルの場所

データは以下に保存されます：
```
mcp-memo-server/data/memos.json
```

初回実行時に自動的に作成されます。

### エラーログの確認

サーバーのエラーログはVSCodeの「Help」→「View Logs」から確認できます。

### 手動テスト

MCPサーバーが正常に動作するか確認：

```bash
cd mcp-memo-server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node index.js
```

## 次のステップ

このサーバーをベースに、以下のような拡張が可能です：

- タグ機能の追加
- 検索機能（タイトルや内容でフィルタ）
- カテゴリ分類
- メモのエクスポート（Markdown、CSV等）
- リソース機能でメモ一覧を提供
- プロンプト機能で定型操作を提供
- SQLiteなどのデータベースへの移行

## 参考リンク

- [MCP公式ドキュメント](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Node.js File System API](https://nodejs.org/api/fs.html)
