#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * 天気情報を取得する関数（Open-Meteo APIを使用）
 * Open-Meteoは無料でAPIキー不要の天気APIです
 */
async function getWeather(city) {
  // 都市名から座標を取得するための簡易マッピング
  const cityCoordinates = {
    tokyo: { lat: 35.6762, lon: 139.6503, name: "東京" },
    osaka: { lat: 34.6937, lon: 135.5023, name: "大阪" },
    kyoto: { lat: 35.0116, lon: 135.7681, name: "京都" },
    fukuoka: { lat: 33.5904, lon: 130.4017, name: "福岡" },
    sapporo: { lat: 43.0642, lon: 141.3469, name: "札幌" },
    nagoya: { lat: 35.1815, lon: 136.9066, name: "名古屋" },
    yokohama: { lat: 35.4437, lon: 139.6380, name: "横浜" },
    kobe: { lat: 34.6901, lon: 135.1955, name: "神戸" },
    sendai: { lat: 38.2682, lon: 140.8694, name: "仙台" },
    hiroshima: { lat: 34.3853, lon: 132.4553, name: "広島" },
  };

  const cityKey = city.toLowerCase();
  const coords = cityCoordinates[cityKey];

  if (!coords) {
    return {
      error: `都市「${city}」が見つかりません。利用可能な都市: ${Object.values(cityCoordinates).map(c => c.name).join(", ")}`,
    };
  }

  try {
    // Open-Meteo APIを使用して天気情報を取得
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&timezone=Asia/Tokyo`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current_weather;

    // 天気コードを日本語に変換
    const weatherCodes = {
      0: "快晴",
      1: "晴れ",
      2: "一部曇り",
      3: "曇り",
      45: "霧",
      48: "霧氷",
      51: "小雨",
      53: "雨",
      55: "大雨",
      61: "弱い雨",
      63: "雨",
      65: "強い雨",
      71: "弱い雪",
      73: "雪",
      75: "強い雪",
      77: "みぞれ",
      80: "にわか雨",
      81: "にわか雨",
      82: "強いにわか雨",
      85: "弱いにわか雪",
      86: "強いにわか雪",
      95: "雷雨",
      96: "雹を伴う雷雨",
      99: "強い雹を伴う雷雨",
    };

    const weatherDescription = weatherCodes[current.weathercode] || "不明";

    return {
      city: coords.name,
      temperature: current.temperature,
      weathercode: current.weathercode,
      weather: weatherDescription,
      windspeed: current.windspeed,
      winddirection: current.winddirection,
      time: current.time,
    };
  } catch (error) {
    return {
      error: `天気情報の取得に失敗しました: ${error.message}`,
    };
  }
}

// MCPサーバーの作成
const server = new Server(
  {
    name: "weather-server",
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
        name: "get_weather",
        description: "指定された都市の現在の天気情報を取得します。日本の主要都市に対応しています。",
        inputSchema: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "都市名（例: tokyo, osaka, kyoto, fukuoka, sapporo, nagoya, yokohama, kobe, sendai, hiroshima）",
            },
          },
          required: ["city"],
        },
      },
    ],
  };
});

// ツール呼び出しのハンドラー
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_weather") {
    const city = request.params.arguments?.city;

    if (!city || typeof city !== "string") {
      throw new Error("都市名が指定されていません");
    }

    const weatherData = await getWeather(city);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(weatherData, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// サーバーの起動
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
