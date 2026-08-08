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
  "chateau-shiozawa": {
    zh: {
      name: "鹽澤城堡",
      region: "越後湯澤",
      summary: "緊鄰舞子和上越國際雪場，地形平緩開闊，人少安靜，非常適合初學者和親子家庭練習。",
      tags: ["新手練習", "人少安靜", "親子推薦"],
    },
    ja: {
      name: "シャトー塩沢",
      region: "越後湯沢",
      summary: "舞子や上越国際に隣接。緩やかで広々としたコースが多く、混雑を避けてじっくり練習したいファミリーや初心者に最適。",
      tags: ["初心者向け", "混雑なし", "ファミリー推奨"],
    },
    en: {
      name: "Chateau Shiozawa",
      region: "Echigo-Yuzawa",
      summary: "Adjacent to Maiko and Joetsu Kokusai. Features wide, gentle slopes and uncrowded atmosphere, perfect for beginners and family practice.",
      tags: ["Beginner practice", "Uncrowded", "Family choice"],
    },
  },
  "nakazato-snow-wood": {
    zh: {
      name: "中里Snow Wood",
      region: "越後湯澤",
      summary: "直連天使格蘭迪亞越後中里酒店，斜面平緩安全性高，極受帶著低齡小朋友的親子家庭歡迎。",
      tags: ["酒店直連", "兒童滑雪", "新手安全"],
    },
    ja: {
      name: "中里スノーウッド",
      region: "越後湯沢",
      summary: "ホテルエンゼルグランディア越後中里に直結。傾斜がゆるやかで安全性が高く、小さなお子様連れのファミリーに大人気。",
      tags: ["ホテル直結", "キッズ向け", "初心者安心"],
    },
    en: {
      name: "Nakazato Snow Wood",
      region: "Echigo-Yuzawa",
      summary: "Directly connected to Hotel Angel Grandia Echigo Nakazato. Gentle slopes and child-friendly design make it ideal for families with young children.",
      tags: ["Hotel direct", "Kids friendly", "Safe for beginners"],
    },
  },
  suhara: {
    zh: {
      name: "須原",
      region: "魚沼",
      summary: "位于鱼沼市的当地传统雪场，积雪丰厚，山顶视野极佳。",
      tags: ["豪雪地带", "绝景展望", "本地特色"],
    },
    ja: {
      name: "須原",
      region: "魚沼",
      summary: "魚沼市にある伝統的なローカルゲレンデ。豊富な積雪量と山頂からのパノラマ絶景が魅力。",
      tags: ["豪雪エリア", "絶景展望", "アットホーム"],
    },
    en: {
      name: "Suhara",
      region: "Uonuma",
      summary: "A traditional local resort in Uonuma city known for deep snow and great summit panoramas.",
      tags: ["Heavy snow", "Scenic views", "Cozy vibe"],
    },
  },
  yakushi: {
    zh: {
      name: "药师",
      region: "鱼沼",
      summary: "紧邻温泉街的小型雪场，坡度平缓，适合新手基础练习。",
      tags: ["温泉直连", "基础练习", "人少平缓"],
    },
    ja: {
      name: "薬師",
      region: "魚沼",
      summary: "温泉街のすぐ近くにあるコンパクトなスキー場。緩斜面中心で初心者の練習に最適。",
      tags: ["温泉近く", "基礎練習", "ファミリー向け"],
    },
    en: {
      name: "Yakushi",
      region: "Uonuma",
      summary: "A compact resort next to an Onsen town, featuring gentle slopes ideal for basic practice.",
      tags: ["Onsen nearby", "Basic practice", "Uncrowded"],
    },
  },
  koide: {
    zh: {
      name: "小出",
      region: "鱼沼",
      summary: "交通便利，邻近车站与市区，适合短时间练习与亲子游玩。",
      tags: ["市区紧邻", "亲子游玩", "练习首选"],
    },
    ja: {
      name: "小出",
      region: "魚沼",
      summary: "市街地や駅から近くアクセス抜群。気軽に滑れるローカルスキー場。",
      tags: ["アクセス良好", "街近い", "サクッと滑れる"],
    },
    en: {
      name: "Koide",
      region: "Uonuma",
      summary: "Located close to the city center and train station, convenient for quick practice sessions.",
      tags: ["Convenient access", "Near city", "Quick practice"],
    },
  },
  "okutadami-maruyama": {
    zh: {
      name: "奥只见丸山",
      region: "鱼沼",
      summary: "秘境级春雪圣地，严冬期常因大雪封山，春季重新开放至5月。",
      tags: ["春雪圣地", "粉雪秘境", "营业至5月"],
    },
    ja: {
      name: "奥只見丸山",
      region: "魚沼",
      summary: "春スキーの聖地として知られる日本有数の豪雪秘境。厳冬期は休业し春に再オープン。",
      tags: ["春スキー聖地", "極上粉雪", "5月まで営業"],
    },
    en: {
      name: "Okutadami Maruyama",
      region: "Uonuma",
      summary: "A legendary spring skiing haven tucked in a deep snow sanctuary, operating well into May.",
      tags: ["Spring ski haven", "Deep snow", "Open until May"],
    },
  },
  "new-green-pia-tsunan": {
    zh: {
      name: "新格林比亚津南",
      region: "津南",
      summary: "综合度假酒店型雪场，提供雪上摩托车等多类游乐项目，家庭体验极佳。",
      tags: ["度假酒店直连", "雪上活动", "适合家庭"],
    },
    ja: {
      name: "ニュー・グリーンピア津南",
      region: "津南",
      summary: "ホテル併設の大型リゾート。スノーモービルなどアクティビティが豊富でファミリーに人気。",
      tags: ["リゾートホテル併設", "アクティビティ豊富", "ファミリー人気"],
    },
    en: {
      name: "New Green Pia Tsunan",
      region: "Tsunan",
      summary: "A comprehensive hotel resort featuring diverse snow activities alongside enjoyable slopes.",
      tags: ["Resort hotel", "Snow activities", "Family favorite"],
    },
  },
  "hakkaisan-sanroku": {
    zh: {
      name: "八海山山麓",
      region: "越後湯澤",
      summary: "位于八海山山麓的家庭社区型雪场，坡度平缓开阔，人少安全，适合儿童与新手基础练习。",
      tags: ["亲子友好", "平缓开阔", "新手练习"],
    },
    ja: {
      name: "八海山麓",
      region: "越後湯沢",
      summary: "八海山の山麓に位置するアットホームなファミリーゲレンデ。緩斜面中心で混雑が少なく初心者やキッズに最適。",
      tags: ["ファミリー向け", "緩斜面", "初心者練習"],
    },
    en: {
      name: "Hakkaisan Sanroku",
      region: "Echigo-Yuzawa",
      summary: "A cozy family resort located at the foot of Mt. Hakkai with wide gentle slopes, perfect for children and beginners.",
      tags: ["Family friendly", "Gentle slopes", "Beginner practice"],
    },
  },
  kashimayari: {
    zh: {
      name: "鹿岛枪",
      region: "白马山麓",
      summary: "位于白马山麓南端，可俯瞰中纲湖绝景，场地地形丰富，亲子乐园设施齐全。",
      tags: ["家庭友善", "湖景展望", "多变地形"],
    },
    ja: {
      name: "鹿島槍",
      region: "白馬山麓",
      summary: "白馬エリア南端に位置し、中綱湖を望むパノラマ絶景が魅力。キッズパークやファミリー施設も充実。",
      tags: ["ファミリー安心", "湖畔絶景", "多彩なコース"],
    },
    en: {
      name: "Kashimayari",
      region: "Hakuba Valley",
      summary: "Located at the southern end of Hakuba Valley overlooking Lake Nakatsuna with great family amenities.",
      tags: ["Family friendly", "Lake view", "Varied terrain"],
    },
  },
  jiigatake: {
    zh: {
      name: "爷岳",
      region: "白马山麓",
      summary: "坡度极平缓且极其安全的社区型雪场，拥有超宽初级道与儿童雪上公园，适合低龄亲子与新手。",
      tags: ["超平缓坡", "儿童公园", "新手首选"],
    },
    ja: {
      name: "爺ヶ岳",
      region: "白馬山麓",
      summary: "見通しが良く緩斜面中心の超アットホームなファミリーゲレンデ。キッズパークがあり小さなお子様に大人気。",
      tags: ["超緩斜面", "キッズパーク", "初心者安心"],
    },
    en: {
      name: "Jiigatake",
      region: "Hakuba Valley",
      summary: "Extremely safe and gentle beginner slopes with a fun kids snow park, perfect for young families.",
      tags: ["Gentle slopes", "Kids park", "Beginner pick"],
    },
  },
  "tsugaike-kogen": {
    zh: {
      name: "栂池高原",
      region: "白马山麓",
      summary: "拥有宽度达千米的超广阔初级斜面“钟鸣之丘”，并提供直升机滑雪与未压雪粉雪骑行区。",
      tags: ["超宽缓坡", "直升机滑雪", "粉雪骑行"],
    },
    ja: {
      name: "栂池高原",
      region: "白馬山麓",
      summary: "コース幅1kmに及ぶ超大緩斜面「鐘の鳴る丘ゲレンデ」が名物。ヘリスキーや非圧雪パウダーエリアも完備。",
      tags: ["1km超大緩斜面", "ヘリスキー", "パウダーライディング"],
    },
    en: {
      name: "Tsugaike Kogen",
      region: "Hakuba Valley",
      summary: "Famous for the 1km wide gentle Kan-no-kane slope, plus heli-skiing and backcountry powder riding.",
      tags: ["1km wide slope", "Heli skiing", "Powder riding"],
    },
  },
  "hakuba-iwatake": {
    zh: {
      name: "白马岩岳",
      region: "白马山麓",
      summary: "独占山头拥有 360 度北阿尔卑斯全景展望，著名网红打卡点 Mountain Harbor 与多样地形深受年轻滑手喜爱。",
      tags: ["360度绝景", "Mountain Harbor", "地形丰富"],
    },
    ja: {
      name: "白馬岩岳",
      region: "白馬山麓",
      summary: "360度北アルプスを望む独立峰ゲレンデ。絶景カフェ Mountain Harbor や多彩な地形コースで大人気。",
      tags: ["360度絶景", "Mountain Harbor", "地形コース"],
    },
    en: {
      name: "Hakuba Iwatake",
      region: "Hakuba Valley",
      summary: "Offers a 360-degree panoramic view of the Northern Alps, featuring the iconic Mountain Harbor deck.",
      tags: ["360 Scenic view", "Mountain Harbor", "Varied terrain"],
    },
  },
  "hakuba-goryu-47": {
    zh: {
      name: "白马五竜 & Hakuba47",
      region: "白马山麓",
      summary: "白马五竜与 Hakuba47 顶峰相连、雪票通用。涵盖规模宏大的夜场滑雪、广阔高品质粉雪区以及白马顶级的地形公园（Terrain Park）。",
      tags: ["五竜47联通", "夜场滑雪", "顶级地形公园"],
    },
    ja: {
      name: "白馬五竜 & Hakuba47",
      region: "白馬山麓",
      summary: "山頂で連結し共通リフト券で滑走できるビッグリゾート。ナイター営業や上質なパウダー、白馬屈指の本格スノーパークを完備。",
      tags: ["五竜47共通券", "ナイター営業", "本格スノーパーク"],
    },
    en: {
      name: "Hakuba Goryu & Hakuba47",
      region: "Hakuba Valley",
      summary: "A combined giant resort connected at the summit under one shared lift pass, featuring night skiing, powder snow, and Hakuba's top terrain park.",
      tags: ["Combined pass", "Night skiing", "Premier terrain park"],
    },
  },
  "hakuba-cortina": {
    zh: {
      name: "白马乘鞍温泉×白马柯尔蒂纳",
      region: "白马山麓",
      summary: "由白马乘鞍温泉与白马柯尔蒂纳两大雪场联通组成，雪票通用，天然降雪量极为丰厚，提供极佳的粉雪与树林滑雪区（Tree Run）。",
      tags: ["雪票通用", "粉雪天堂", "树林滑雪"],
    },
    ja: {
      name: "白馬乗鞍温泉×白馬コルチナ",
      region: "白馬山麓",
      summary: "白馬乗鞍温泉と白馬コルチナが連結し共通リフト券で遊べるビッグゲレンデ。エリア屈指の天然降雪量と極上パウダー・ツリーランが魅力。",
      tags: ["共通リフト券", "パウダー天国", "ツリーラン"],
    },
    en: {
      name: "Hakuba Norikura & Hakuba Cortina",
      region: "Hakuba Valley",
      summary: "Interconnected resort combining Hakuba Norikura Onsen and Hakuba Cortina under a shared lift pass, famed for top-tier powder snow and tree runs.",
      tags: ["Shared lift pass", "Powder haven", "Tree run"],
    },
  },
  "hakuba-sanosaka": {
    zh: {
      name: "白马佐野坂",
      region: "白马山麓",
      summary: "紧邻青木湖，风景清秀，坡度平缓且人少不拥挤，拥有优质猫跳（Mogul）练习道与公园设施。",
      tags: ["青木湖景", "人少平缓", "猫跳与公园"],
    },
    ja: {
      name: "白馬さのさか",
      region: "白馬山麓",
      summary: "青木湖を見下ろす美しいロケーション。混雑が少なく落ち着いて練習でき、本格モーグルコースやパークも完備。",
      tags: ["青木湖絶景", "混雑なし", "モーグル＆パーク"],
    },
    en: {
      name: "Hakuba Sanosaka",
      region: "Hakuba Valley",
      summary: "Picturesque setting overlooking Lake Aoki, peaceful slopes, mogul courses, and terrain park.",
      tags: ["Lake Aoki view", "Uncrowded", "Moguls & park"],
    },
  },
  "hakuba-happo-one": {
    zh: {
      name: "白马八方尾根",
      region: "白马山麓",
      summary: "长野冬奥会比赛举办场地，垂直落差超过千米，拥有一流的超长雪道与挑战性急陡坡，是高手必去之圣地。",
      tags: ["冬奥会赛道", "千米落差", "长途大坡"],
    },
    ja: {
      name: "白馬八方尾根",
      region: "白馬山麓",
      summary: "長野五輪の舞台となった日本を代表する名門ゲレンデ。標高差1,000m超のロングコースと圧巻の急斜面が自慢。",
      tags: ["オリンピック舞台", "標高差1000m", "ロングコース"],
    },
    en: {
      name: "Hakuba Happo-one",
      region: "Hakuba Valley",
      summary: "Host of the 1998 Winter Olympics, boasting over 1,000m vertical drop, steep pitches, and long runs.",
      tags: ["Olympic venue", "1000m Vertical", "Long steep runs"],
    },
  },

};

export function getResortContent(slug: string, locale: Locale): ResortContent {
  return resortContent[slug][locale];
}
