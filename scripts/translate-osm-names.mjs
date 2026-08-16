/**
 * translate-osm-names.mjs
 *
 * 遍历 public/osm/*.json 中的雪道（runs）与缆车（lifts），
 * 根据 OSM 原始 name、name:ja、name:en、name:zh 等字段，
 * 以及结合中/日/英常用滑雪词汇映射规则，为每个 Feature 生成并写入：
 *   - nameJa (日本語)
 *   - nameEn (English)
 *   - nameZh (简体中文)
 *
 * 用法：
 *   node scripts/translate-osm-names.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OSM_DIR = join(__dirname, "..", "public", "osm");

// ── 常用汉字繁简对照字典 ──────────────────────────────────────────────────
const KANJI_TO_ZH = {
  湯: "汤", 澤: "泽", 沢: "泽", 國: "国", 長: "长", 峰: "峰", 線: "线",
  車: "车", 連: "连", 東: "东", 關: "关", 廣: "广", 頭: "头", 風: "风",
  飛: "飞", 開: "开", 龍: "龙", 竜: "龙", 雲: "云", 頂: "顶", 橋: "桥",
  園: "园", 楽: "乐", 樂: "乐", 場: "场", 観: "观", 觀: "观", 銀: "银",
  駅: "站", 乗: "乘", 萬: "万", 廣: "广", 島: "岛", 陸: "陆", 櫻: "樱",
  桜: "樱", 滝: "瀑", 瀧: "瀑", 谷: "谷", 岡: "冈", 蔵: "藏", 富士: "富士",
  駒: "驹", 鶴: "鹤", 宝: "宝", 寶: "宝", 権: "权", 權: "权", 港: "港",
  勝: "胜", 萬: "万", 郷: "乡", 坂: "坂", 井: "井", 原: "原", 笹: "笹",
};

// ── 特殊已知专有名词翻译词典 ──────────────────────────────────────────────
const KNOWN_NAMES = {
  // GALA 湯沢
  "林道湯の沢線": { nameJa: "林道湯の沢線", nameEn: "Yunosawa Rinkan Trail", nameZh: "汤之泽林道雪道" },
  Batman: { nameJa: "バットマン", nameEn: "Batman", nameZh: "蝙蝠侠雪道" },
  Edelweiss: { nameJa: "エーデルワイス", nameEn: "Edelweiss", nameZh: "雪绒花雪道" },
  Entertainment: { nameJa: "エンターテイメント", nameEn: "Entertainment", nameZh: "娱乐雪道" },
  Gigi: { nameJa: "ジジ", nameEn: "Gigi", nameZh: "琪琪雪道" },
  Melody: { nameJa: "メロディ", nameEn: "Melody", nameZh: "旋律雪道" },
  "下山コース ファルコン": { nameJa: "下山コース ファルコン", nameEn: "Falcon Downhill Course", nameZh: "猎鹰下山雪道" },
  "湯沢高原ロープウェイ": { nameJa: "湯沢高原ロープウェイ", nameEn: "Yuzawa Kogen Ropeway", nameZh: "汤泽高原大型缆车" },
  コスモスペアリフト: { nameJa: "コスモスペアリフト", nameEn: "Cosmos Pair Lift", nameZh: "大波斯菊双人缆车" },
  高原エクスプレス: { nameJa: "高原エクスプレス", nameEn: "Kogen Express", nameZh: "高原高速缆车" },
  山頂パノラマリフト: { nameJa: "山頂パノラマリフト", nameEn: "Sancho Panorama Lift", nameZh: "山顶全景缆车" },
  布場ファミリーリフト: { nameJa: "布場ファミリーリフト", nameEn: "Nunoba Family Lift", nameZh: "布场亲子缆车" },
  布場ロマンスリフト: { nameJa: "布場ロマンスリフト", nameEn: "Nunoba Romance Lift", nameZh: "布场浪漫缆车" },

  // 上越国际
  "長峰ゲレンデ": { nameJa: "長峰ゲレンデ", nameEn: "Nagamine Slope", nameZh: "长峰雪道" },
  "Osawa Course": { nameJa: "大沢コース", nameEn: "Osawa Course", nameZh: "大泽雪道" },
  "Hotel-Front Ski Slope": { nameJa: "ホテル前ゲレンデ", nameEn: "Hotel-Front Slope", nameZh: "酒店前雪道" },
};

// ── 常用中日英片假名/汉字替换词典 ──────────────────────────────────────────
const DICT_REPLACEMENTS = [
  // 滑雪类型/设施
  { pattern: /下山コース/g, ja: "下山コース", en: "Downhill Course", zh: "下山雪道" },
  { pattern: /林間コース/g, ja: "林間コース", en: "Forest Course", zh: "林间雪道" },
  { pattern: /林道/g, ja: "林道", en: "Forest Trail", zh: "林道" },
  { pattern: /ゲレンデ/g, ja: "ゲレンデ", en: "Slope", zh: "雪道" },
  { pattern: /コース/g, ja: "コース", en: "Course", zh: "雪道" },
  { pattern: /バイパス/g, ja: "バイパス", en: "Bypass", zh: "联络道" },
  { pattern: /連絡/g, ja: "連絡", en: "Connection", zh: "联络" },
  { pattern: /中央/g, ja: "中央", en: "Central", zh: "中央" },
  { pattern: /山頂/g, ja: "山頂", en: "Summit", zh: "山顶" },
  { pattern: /山麓/g, ja: "山麓", en: "Base", zh: "山麓" },
  { pattern: /初心者/g, ja: "初心者", en: "Beginner", zh: "初学者" },
  { pattern: /上級/g, ja: "上級", en: "Advanced", zh: "高级" },
  { pattern: /中級/g, ja: "中級", en: "Intermediate", zh: "中级" },

  // 片假名常见词
  { pattern: /パノラマ/g, ja: "パノラマ", en: "Panorama", zh: "全景" },
  { pattern: /チャレンジ/g, ja: "チャレンジ", en: "Challenge", zh: "挑战" },
  { pattern: /チャンピオン/g, ja: "チャンピオン", en: "Champion", zh: "冠军" },
  { pattern: /ダイナミック/g, ja: "ダイナミック", en: "Dynamic", zh: "动态" },
  { pattern: /ファミリー/g, ja: "ファミリー", en: "Family", zh: "亲子" },
  { pattern: /ロマンス/g, ja: "ロマンス", en: "Romance", zh: "浪漫" },
  { pattern: /エキスパート/g, ja: "エキスパート", en: "Expert", zh: "专家" },
  { pattern: /テクニカル/g, ja: "テクニカル", en: "Technical", zh: "技术" },
  { pattern: /スクランブル/g, ja: "スクランブル", en: "Scramble", zh: "攀登" },
  { pattern: /プロムナード/g, ja: "プロムナード", en: "Promenade", zh: "漫步" },
  { pattern: /パラダイス/g, ja: "パラダイス", en: "Paradise", zh: "天堂" },
  { pattern: /サンライズ/g, ja: "サンライズ", en: "Sunrise", zh: "日出" },
  { pattern: /サンセット/g, ja: "サンセット", en: "Sunset", zh: "日落" },
  { pattern: /スカイライン/g, ja: "スカイライン", en: "Skyline", zh: "天际线" },
  { pattern: /クリスタル/g, ja: "クリスタル", en: "Crystal", zh: "水晶" },
  { pattern: /ダイヤモンド/g, ja: "ダイヤモンド", en: "Diamond", zh: "钻石" },
  { pattern: /エンジェル/g, ja: "エンジェル", en: "Angel", zh: "天使" },
  { pattern: /スマイル/g, ja: "スマイル", en: "Smile", zh: "微笑" },
  { pattern: /ファルコン/g, ja: "ファルコン", en: "Falcon", zh: "猎鹰" },
  { pattern: /アルペン/g, ja: "アルペン", en: "Alpen", zh: "高山" },

  // 缆车词汇
  { pattern: /クワッドリフト|クワッド/g, ja: "クワッドリフト", en: "Quad Lift", zh: "四人缆车" },
  { pattern: /ペアリフト|ペア/g, ja: "ペアリフト", en: "Pair Lift", zh: "双人缆车" },
  { pattern: /トリプルリフト|トリプル/g, ja: "トリプルリフト", en: "Triple Lift", zh: "三人缆车" },
  { pattern: /シングルリフト|シングル/g, ja: "シングルリフト", en: "Single Lift", zh: "单人缆车" },
  { pattern: /エクスプレス/g, ja: "エクスプレス", en: "Express", zh: "高速缆车" },
  { pattern: /ロープウェイ/g, ja: "ロープウェイ", en: "Ropeway", zh: "大型索道" },
  { pattern: /ゴンドラ/g, ja: "ゴンドラ", en: "Gondola", zh: "箱式缆车" },
  { pattern: /リフト/g, ja: "リフト", en: "Lift", zh: "缆车" },
];

// ── 简易中文字符转换 ──────────────────────────────────────────────────────
function kanjiToZh(str) {
  let res = "";
  for (const ch of str) {
    res += KANJI_TO_ZH[ch] ?? ch;
  }
  return res;
}

// ── 检查字符串是否主要为日语（包含假名或全角）──────────────────────────────
function isJapaneseText(str) {
  return /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(str);
}

// ── 检查字符串是否主要是英文/拉丁字符 ────────────────────────────────────
function isEnglishText(str) {
  return /^[A-Za-z0-9\s\-._&'#()$]+$/.test(str);
}

// ── 将日文缆车/雪道名翻译为 EN 和 ZH ──────────────────────────────────────
function translateJapaneseName(name, isLift) {
  let nameJa = name;
  let nameEn = name;
  let nameZh = kanjiToZh(name);

  // 全角数字转半角
  nameJa = nameJa.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
  nameEn = nameEn.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
  nameZh = nameZh.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

  // 编号规范化：第1 -> No.1 (EN), 第1 (ZH)
  nameEn = nameEn.replace(/第\s*([0-9]+)/g, "No.$1 ");

  for (const item of DICT_REPLACEMENTS) {
    nameZh = nameZh.replace(item.pattern, item.zh);
    nameEn = nameEn.replace(item.pattern, " " + item.en + " ");
  }

  nameEn = nameEn.replace(/\s+/g, " ").trim();
  nameZh = nameZh.replace(/\s+/g, " ").trim();

  return { nameJa, nameEn, nameZh };
}

// ── 将英文缆车/雪道名翻译为 JA 和 ZH ──────────────────────────────────────
function translateEnglishName(name, isLift) {
  let nameEn = name;
  let nameJa = name;
  let nameZh = name;

  // 处理编号 1st, 2nd, No. 1 -> 第1
  nameZh = nameZh
    .replace(/(?:(\d+)(?:st|nd|rd|th)|No\.\s*(\d+)|Number\s*(\d+))/gi, (m, p1, p2, p3) => `第${p1 || p2 || p3}`);
  nameJa = nameJa
    .replace(/(?:(\d+)(?:st|nd|rd|th)|No\.\s*(\d+)|Number\s*(\d+))/gi, (m, p1, p2, p3) => `第${p1 || p2 || p3}`);

  if (isLift) {
    nameZh = nameZh
      .replace(/Quad Lift|Quad/gi, "四人缆车")
      .replace(/Pair Lift|Pair/gi, "双人缆车")
      .replace(/Triple Lift|Triple/gi, "三人缆车")
      .replace(/Single Lift|Single/gi, "单人缆车")
      .replace(/Romance Lift|Romance/gi, "浪漫缆车")
      .replace(/Family Lift|Family/gi, "亲子缆车")
      .replace(/High Speed|Express/gi, "高速")
      .replace(/Gondola/gi, "箱式缆车")
      .replace(/Ropeway|Cable Car/gi, "索道缆车")
      .replace(/Chairlift|Chair Lift|Lift/gi, "缆车");

    nameJa = nameJa
      .replace(/Quad Lift|Quad/gi, "クワッドリフト")
      .replace(/Pair Lift|Pair/gi, "ペアリフト")
      .replace(/Triple Lift|Triple/gi, "トリプルリフト")
      .replace(/Single Lift|Single/gi, "シングルリフト")
      .replace(/Romance Lift/gi, "ロマンスリフト")
      .replace(/Family Lift/gi, "ファミリーリフト")
      .replace(/High Speed|Express/gi, "高速")
      .replace(/Gondola/gi, "ゴンドラ")
      .replace(/Ropeway|Cable Car/gi, "ロープウェイ")
      .replace(/Chairlift|Chair Lift|Lift/gi, "リフト");
  } else {
    nameZh = nameZh
      .replace(/Course/gi, "雪道")
      .replace(/Trail/gi, "雪道")
      .replace(/Slope/gi, "雪道")
      .replace(/Run/gi, "雪道")
      .replace(/Downhill/gi, "下山")
      .replace(/Forest/gi, "林间")
      .replace(/Connection|Connector/gi, "联络")
      .replace(/Bypass/gi, "联络道")
      .replace(/Beginner/gi, "初级")
      .replace(/Intermediate/gi, "中级")
      .replace(/Advanced/gi, "高级")
      .replace(/Expert/gi, "专家")
      .replace(/Challenge/gi, "挑战")
      .replace(/Champion/gi, "冠军")
      .replace(/Panorama/gi, "全景")
      .replace(/Family/gi, "亲子");

    nameJa = nameJa
      .replace(/Course/gi, "コース")
      .replace(/Trail/gi, "コース")
      .replace(/Slope/gi, "ゲレンデ")
      .replace(/Run/gi, "コース")
      .replace(/Connection/gi, "連絡コース")
      .replace(/Bypass/gi, "バイパス")
      .replace(/Panorama/gi, "パノラマ");
  }

  nameZh = nameZh.replace(/\s+/g, " ").trim();
  nameJa = nameJa.replace(/\s+/g, " ").trim();

  return { nameJa, nameEn, nameZh };
}

// ── 核心三语转换推导逻辑 ──────────────────────────────────────────────────
function resolve3Languages(rawName, rawJa, rawEn, isLift) {
  if (!rawName && !rawJa && !rawEn) {
    return { nameJa: null, nameEn: null, nameZh: null };
  }

  const baseName = rawName ?? rawJa ?? rawEn;

  // 1. 已有已知词典映射
  if (KNOWN_NAMES[baseName]) {
    return KNOWN_NAMES[baseName];
  }

  // 2. 如果原始包含日文字符
  if (isJapaneseText(baseName)) {
    const res = translateJapaneseName(baseName, isLift);
    if (rawJa) res.nameJa = rawJa;
    if (rawEn) res.nameEn = rawEn;
    return res;
  }

  // 3. 如果原始是纯英文
  if (isEnglishText(baseName)) {
    const res = translateEnglishName(baseName, isLift);
    if (rawJa) res.nameJa = rawJa;
    if (rawEn) res.nameEn = rawEn;
    return res;
  }

  // 4. 其他情况 fallback
  return {
    nameJa: rawJa ?? baseName,
    nameEn: rawEn ?? baseName,
    nameZh: kanjiToZh(baseName),
  };
}

// ── 主逻辑：遍历处理所有 public/osm/*.json ─────────────────────────────────
function main() {
  const files = readdirSync(OSM_DIR).filter((f) => f.endsWith(".json"));

  console.log(`\n🌐 Translating names to 3 languages (ZH, JA, EN) across ${files.length} OSM files...\n`);

  let updatedFiles = 0;
  let totalRunsCount = 0;
  let totalLiftsCount = 0;

  for (const file of files) {
    const filePath = join(OSM_DIR, file);
    let data;
    try {
      data = JSON.parse(readFileSync(filePath, "utf8"));
    } catch {
      continue;
    }

    let modified = false;

    // 处理 runs
    if (data.runs?.features) {
      for (const feature of data.runs.features) {
        const props = feature.properties;
        const { nameJa, nameEn, nameZh } = resolve3Languages(props.name, props.nameJa, props.nameEn, false);
        props.nameJa = nameJa;
        props.nameEn = nameEn;
        props.nameZh = nameZh;
        totalRunsCount++;
      }
      modified = true;
    }

    // 处理 lifts
    if (data.lifts?.features) {
      for (const feature of data.lifts.features) {
        const props = feature.properties;
        const { nameJa, nameEn, nameZh } = resolve3Languages(props.name, props.nameJa, props.nameEn, true);
        props.nameJa = nameJa;
        props.nameEn = nameEn;
        props.nameZh = nameZh;
        totalLiftsCount++;
      }
      modified = true;
    }

    if (modified) {
      writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
      updatedFiles++;
    }
  }

  console.log(`✅ Completed translating ${updatedFiles} files.`);
  console.log(`   Processed ${totalRunsCount} runs and ${totalLiftsCount} lifts.\n`);
}

main();
