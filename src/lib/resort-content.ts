import type { Locale } from "@/i18n/routing";

export interface ResortContent {
  name: string;
  region: string;
  summary: string;
  tags: string[];
}

type ContentMap = Record<string, Record<Locale, ResortContent>>;

export const resortContent: ContentMap = {
  "gala-yuzawa": {
    zh: {
      name: "GALA湯沢",
      region: "越後湯澤",
      summary: "新干线站直连雪场，换乘时间几乎为零，是东京日归最常见的选择之一。",
      tags: ["新干线直达", "适合新手", "站内换装"],
    },
    ja: {
      name: "GALA湯沢",
      region: "越後湯沢",
      summary: "新幹線の駅から直結。乗り換えの手間がほぼゼロで、東京からの日帰りで最も選ばれる定番。",
      tags: ["新幹線直結", "初心者向け", "駅チェンジ"],
    },
    en: {
      name: "GALA Yuzawa",
      region: "Echigo-Yuzawa",
      summary: "Connected directly to the shinkansen station, so transfer time is nearly zero — one of the most common Tokyo day-trip picks.",
      tags: ["Shinkansen direct", "Beginner friendly", "Change at the station"],
    },
  },
  naeba: {
    zh: {
      name: "苗場",
      region: "越後湯澤",
      summary: "规模较大，可通过缆车连接龙隈雪场，适合想多体验几种地形的雪友。",
      tags: ["雪道丰富", "可接驳龙隈", "落差大"],
    },
    ja: {
      name: "苗場",
      region: "越後湯沢",
      summary: "規模が大きく、ゴンドラで龍隈スキー場と接続。いろいろな地形を滑りたい人向け。",
      tags: ["コース豊富", "龍隈と接続", "標高差が大きい"],
    },
    en: {
      name: "Naeba",
      region: "Echigo-Yuzawa",
      summary: "A large resort connected by gondola to Kagura's Tashiro area — good for skiers who want varied terrain.",
      tags: ["Wide run selection", "Linked to Kagura", "Big vertical"],
    },
  },
  kagura: {
    zh: {
      name: "神樂",
      region: "越後湯澤",
      summary: "以粉雪和自然地形著称，田代/神樂/龙隈三区相连，雪季长。",
      tags: ["粉雪出名", "地形丰富", "偏进阶"],
    },
    ja: {
      name: "かぐら",
      region: "越後湯沢",
      summary: "パウダースノーと自然地形で知られ、田代・かぐら・龍隈の3エリアが連結。シーズンが長い。",
      tags: ["パウダー", "地形が豊富", "上級者向け"],
    },
    en: {
      name: "Kagura",
      region: "Echigo-Yuzawa",
      summary: "Known for powder and natural terrain, with the Tashiro / Kagura / Mitsumata areas linked together. Long season.",
      tags: ["Known for powder", "Varied terrain", "Skews advanced"],
    },
  },
  kawaba: {
    zh: {
      name: "川場",
      region: "群馬・川場",
      summary: "没有直达新干线，但关越高速下道即到，自驾人群评价很高。",
      tags: ["开车方便", "初学者友好", "关东圈内"],
    },
    ja: {
      name: "川場",
      region: "群馬・川場",
      summary: "新幹線は直結していないが、関越自動車道のICから近く、車で来る人からの評価が高い。",
      tags: ["車でアクセス良好", "初心者向け", "関東近郊"],
    },
    en: {
      name: "Kawaba",
      region: "Gunma / Kawaba",
      summary: "No direct shinkansen access, but close to the Kan-etsu Expressway exit — popular with people driving in.",
      tags: ["Easy by car", "Beginner friendly", "Close to Kanto"],
    },
  },
  "oze-iwakura": {
    zh: {
      name: "尾瀬岩鞍",
      region: "群馬・片品",
      summary: "拥有120人大型箱型缆车，山顶视野极佳，家庭游客比例较高。",
      tags: ["箱型缆车", "视野开阔", "适合家庭"],
    },
    ja: {
      name: "尾瀬岩鞍",
      region: "群馬・片品",
      summary: "定員120名の大型ゴンドラがあり、山頂からの眺めが良い。ファミリー層の利用も多い。",
      tags: ["大型ゴンドラ", "眺望良好", "ファミリー向け"],
    },
    en: {
      name: "Oze Iwakura",
      region: "Gunma / Katashina",
      summary: "Has a large 120-person gondola and excellent summit views — popular with families.",
      tags: ["Large gondola", "Great views", "Family friendly"],
    },
  },
  "karuizawa-prince": {
    zh: {
      name: "軽井澤王子",
      region: "長野・輕井澤",
      summary: "落差小、坡度缓，配合轻井泽outlet，是新手和亲子出行的热门首选。",
      tags: ["新干线直达", "极适合新手", "购物联动"],
    },
    ja: {
      name: "軽井沢プリンス",
      region: "長野・軽井沢",
      summary: "標高差が小さく緩斜面が中心。軽井沢アウトレットと組み合わせやすく、初心者やファミリーに人気。",
      tags: ["新幹線直結", "初心者に最適", "アウトレット併設"],
    },
    en: {
      name: "Karuizawa Prince",
      region: "Nagano / Karuizawa",
      summary: "Gentle slopes with a small vertical drop, right next to the Karuizawa outlet mall — a favorite for beginners and families.",
      tags: ["Shinkansen direct", "Great for beginners", "Outlet mall nearby"],
    },
  },
};

export function getResortContent(slug: string, locale: Locale): ResortContent {
  return resortContent[slug][locale];
}
