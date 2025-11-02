#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// メモデータのファイルパス
const MEMOS_FILE = path.join(__dirname, "data", "memos.json");

/**
 * メモデータを読み込む
 */
async function loadMemos() {
  try {
    const data = await fs.readFile(MEMOS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // ファイルが存在しない場合は空の構造を返す
    if (error.code === "ENOENT") {
      return { memos: [] };
    }
    throw error;
  }
}

/**
 * メモデータを保存する
 */
async function saveMemos(data) {
  // dataディレクトリが存在しない場合は作成
  const dataDir = path.dirname(MEMOS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }

  await fs.writeFile(MEMOS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * 新しいメモを作成
 */
async function createMemo(title, content) {
  const data = await loadMemos();

  // 新しいIDを生成（既存の最大ID + 1）
  const maxId = data.memos.length > 0
    ? Math.max(...data.memos.map(m => parseInt(m.id)))
    : 0;
  const newId = (maxId + 1).toString();

  const now = new Date().toISOString();
  const newMemo = {
    id: newId,
    title,
    content,
    createdAt: now,
    updatedAt: now,
  };

  data.memos.push(newMemo);
  await saveMemos(data);

  return newMemo;
}

/**
 * メモを読み込む
 */
async function readMemos(id = null) {
  const data = await loadMemos();

  if (id) {
    const memo = data.memos.find(m => m.id === id);
    if (!memo) {
      return { error: `ID「${id}」のメモが見つかりません` };
    }
    return memo;
  }

  return data.memos;
}

/**
 * メモを更新
 */
async function updateMemo(id, title, content) {
  const data = await loadMemos();

  const memoIndex = data.memos.findIndex(m => m.id === id);
  if (memoIndex === -1) {
    return { error: `ID「${id}」のメモが見つかりません` };
  }

  const memo = data.memos[memoIndex];

  // 指定されたフィールドのみ更新
  if (title !== undefined) {
    memo.title = title;
  }
  if (content !== undefined) {
    memo.content = content;
  }
  memo.updatedAt = new Date().toISOString();

  data.memos[memoIndex] = memo;
  await saveMemos(data);

  return memo;
}

/**
 * メモを削除
 */
async function deleteMemo(id) {
  const data = await loadMemos();

  const memoIndex = data.memos.findIndex(m => m.id === id);
  if (memoIndex === -1) {
    return { error: `ID「${id}」のメモが見つかりません` };
  }

  const deletedMemo = data.memos[memoIndex];
  data.memos.splice(memoIndex, 1);
  await saveMemos(data);

  return { success: true, deletedMemo };
}

// MCPサーバーの作成
const server = new Server(
  {
    name: "memo-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ツール一覧のハンドラー
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_memo",
        description: "新しいメモを作成します",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "メモのタイトル",
            },
            content: {
              type: "string",
              description: "メモの内容",
            },
          },
          required: ["title", "content"],
        },
      },
      {
        name: "read_memo",
        description: "メモを読み込みます。IDを指定すると特定のメモを、指定しないと全てのメモを取得します",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "メモのID（省略可能。省略すると全メモを取得）",
            },
          },
        },
      },
      {
        name: "update_memo",
        description: "既存のメモを更新します",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "更新するメモのID",
            },
            title: {
              type: "string",
              description: "新しいタイトル（省略可能）",
            },
            content: {
              type: "string",
              description: "新しい内容（省略可能）",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "delete_memo",
        description: "メモを削除します",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "削除するメモのID",
            },
          },
          required: ["id"],
        },
      },
    ],
  };
});

// ツール呼び出しのハンドラー
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "create_memo":
        if (!args?.title || !args?.content) {
          throw new Error("タイトルと内容は必須です");
        }
        result = await createMemo(args.title, args.content);
        break;

      case "read_memo":
        result = await readMemos(args?.id);
        break;

      case "update_memo":
        if (!args?.id) {
          throw new Error("IDは必須です");
        }
        if (!args?.title && !args?.content) {
          throw new Error("タイトルまたは内容のいずれかは必須です");
        }
        result = await updateMemo(args.id, args.title, args.content);
        break;

      case "delete_memo":
        if (!args?.id) {
          throw new Error("IDは必須です");
        }
        result = await deleteMemo(args.id);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// サーバーの起動
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Memo MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
