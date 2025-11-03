#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// 都市データを共通で使用（Tools, Resources, Promptsで参照）
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

/**
 * 天気情報を取得する関数（Open-Meteo APIを使用）
 * Open-Meteoは無料でAPIキー不要の天気APIです
 */
async function getWeather(city) {

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
      resources: {},
      prompts: {},
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

// リソース一覧のハンドラー
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "weather://cities",
        name: "対応都市一覧",
        description: "このサーバーが対応している日本の主要都市のリスト",
        mimeType: "application/json",
      },
    ],
  };
});

// リソース読み込みのハンドラー
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === "weather://cities") {
    // 都市一覧をJSON形式で返す
    const cities = Object.entries(cityCoordinates).map(([key, value]) => ({
      id: key,
      name: value.name,
      latitude: value.lat,
      longitude: value.lon,
    }));

    return {
      contents: [
        {
          uri: uri,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              description: "天気サーバーが対応している都市の一覧",
              totalCities: cities.length,
              cities: cities,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// プロンプト一覧のハンドラー
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "compare-weather",
        description: "2つの都市の天気を比較します",
        arguments: [
          {
            name: "city1",
            description: "比較する最初の都市（例: tokyo）",
            required: true,
          },
          {
            name: "city2",
            description: "比較する2番目の都市（例: osaka）",
            required: true,
          },
        ],
      },
    ],
  };
});

// プロンプト取得のハンドラー
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const promptName = request.params.name;

  if (promptName === "compare-weather") {
    const city1 = request.params.arguments?.city1 || "tokyo";
    const city2 = request.params.arguments?.city2 || "osaka";

    // 都市名の日本語表記を取得
    const city1Name = cityCoordinates[city1.toLowerCase()]?.name || city1;
    const city2Name = cityCoordinates[city2.toLowerCase()]?.name || city2;

    return {
      description: `${city1Name}と${city2Name}の天気を比較`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `${city1Name}と${city2Name}の現在の天気を取得して、以下の観点で比較してください：
1. 気温の違い
2. 天気の違い（晴れ、曇り、雨など）
3. 風速の違い
4. どちらの都市がより過ごしやすいか

get_weatherツールを使って両都市の天気情報を取得し、分かりやすく比較してください。`,
          },
        },
      ],
    };
  }

  throw new Error(`Unknown prompt: ${promptName}`);
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
