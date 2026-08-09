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
  "sugadaira-kogen": {
    zh: {
      name: "菅平高原",
      region: "上信越高原",
      summary: "本州集寒地带，以极低气温和紧致硬雪打理道（冰雪与压雪神场）著称。由太郎、大峰、Pine Beak三大区域组成，共60条雪道。",
      tags: ["超广阔雪场", "极寒雪质", "压雪神场"],
    },
    ja: {
      name: "菅平高原",
      region: "上信越高原",
      summary: "本州屈指の極寒エリアに位置し、極上の締め固まった圧雪バーン（ダイヤモンドダスト）で有名。太郎・ダボス・パインビークの全60コース。",
      tags: ["ビッグゲレンデ", "極寒・極上バーン", "圧雪名所"],
    },
    en: {
      name: "Sugadaira Kogen",
      region: "Joshinetsu Kogen",
      summary: "Located in one of Honshu's coldest plateaus, famous for diamond dust and fast, perfectly groomed hard-pack snow. Offers 60 courses across three peaks.",
      tags: ["Huge resort", "Ultra cold snow", "Groomer paradise"],
    },
  },
  "palcall-tsumagoi": {
    zh: {
      name: "Palcall嬬恋",
      region: "上信越高原",
      summary: "拥有关东最长（3,193米）的箱型缆车，山顶标高突破2,000米。早晨6点起开放极具特色的日出早鸟滑雪（Sunrise Ski）。",
      tags: ["关东最长缆车", "日出早鸟滑雪", "标高2000m+"],
    },
    ja: {
      name: "パルコール嬬恋",
      region: "上信越高原",
      summary: "関東最長3,193mのゴンドラを擁し、山頂標高2,050m。早朝6時からのサンライズスキーと極上のモーニング圧雪が大人気。",
      tags: ["関東最長ゴンドラ", "サンライズ滑走", "標高2000m超"],
    },
    en: {
      name: "Palcall Tsumagoi",
      region: "Joshinetsu Kogen",
      summary: "Home to Kanto's longest gondola (3,193m) with a summit elevation of 2,050m. Famous for 6:00 AM Sunrise Skiing on pristine morning groomers.",
      tags: ["Longest Gondola", "Sunrise Skiing", "High Altitude 2000m+"],
    },
  },
  "manza-onsen": {
    zh: {
      name: "万座温泉",
      region: "上信越高原",
      summary: "西武旗下的滑雪场。位于海拔1800米以上的日本最高温泉乡之一“万座温泉”，以干爽轻盈的高海拔粉雪和浓郁乳白色硫磺温泉闻名。",
      tags: ["高海拔粉雪", "秘汤乳白温泉", "西武旗下"],
    },
    ja: {
      name: "万座温泉",
      region: "上信越高原",
      summary: "プリンスホテル運営。標高1,800m超の「粉雪の万座」と称される極上パウダーと、日本有数の濃厚なミルキー硫黄泉が同時に楽しめる。",
      tags: ["パウダースノー", "日本屈指の硫黄泉", "プリンスホテル"],
    },
    en: {
      name: "Manza Onsen",
      region: "Joshinetsu Kogen",
      summary: "Operated by Prince Hotels. Situated at over 1,800m elevation, offering exquisite powder snow paired with famous rich milky-white sulfur hot springs.",
      tags: ["High Altitude Powder", "Famous Sulfur Onsen", "Prince Hotels"],
    },
  },
  "kusatsu-onsen": {
    zh: {
      name: "草津温泉",
      region: "上信越高原",
      summary: "毗邻日本三大名泉之一“草津温泉”，配备全新脉冲式箱型缆车与天狗山公园，滑完雪直接前往汤畑散步泡温泉。",
      tags: ["草津名泉直达", "脉冲缆车", "温泉街观光"],
    },
    ja: {
      name: "草津温泉",
      region: "上信越高原",
      summary: "日本三名泉「草津温泉」に隣接。最新のパルスゴンドラや天狗山メインゲレンデを備え、アフタースキーの湯畑散策も魅力。",
      tags: ["草津温泉直結", "パルスゴンドラ", "アフタースキー最高"],
    },
    en: {
      name: "Kusatsu Onsen",
      region: "Joshinetsu Kogen",
      summary: "Located right next to Kusatsu Onsen town. Features modern Pulse Gondola and Tenguyama slopes, combining skiing with famous hot spring walks.",
      tags: ["Kusatsu Onsen direct", "Pulse Gondola", "Hot Spring Village"],
    },
  },
  "kazawa-snow-area": {
    zh: {
      name: "鹿泽雪区",
      region: "上信越高原",
      summary: "位于鹿泽高原，凭造雪能力与高晴天率实现每年11月下旬早开，以扎实的硬质硬雪打理道和竞技旗门训练闻名。",
      tags: ["早鸟11月开业", "竞技旗门圣地", "高晴天率"],
    },
    ja: {
      name: "鹿沢スノーエリア",
      region: "上信越高原",
      summary: "群馬・鹿沢高原に位置し、11月下旬からの早期オープンと締まった競技向けバーンで有名。レーサーや早期滑走派に人気。",
      tags: ["早期オープン", "レーシング名所", "晴天率抜群"],
    },
    en: {
      name: "Kazawa Snow Area",
      region: "Joshinetsu Kogen",
      summary: "Renowned for its early season opening in late November and firm, high-quality groomed snow ideal for race training and early-season skiing.",
      tags: ["Early Season Open", "Race Training Grounds", "High Sunny Rate"],
    },
  },
  "minenohara-kogen": {
    zh: {
      name: "峰之原高原",
      region: "上信越高原",
      summary: "坐拥远眺北阿尔卑斯雄伟连峰绝景的高原雪场（回归峰之原高原原名）。标高1,500米，拥有丰富的亲子儿童乐园。",
      tags: ["北阿尔卑斯绝景", "家庭儿童乐园", "高海拔轻雪"],
    },
    ja: {
      name: "峰の原高原",
      region: "上信越高原",
      summary: "北アルプスの絶景を望む標高1,500mの高原ゲレンデ（旧ニンジャスノーハイランド）。キッズパークや家族向けアクティビティが充実。",
      tags: ["絶景ビュー", "キッズパーク充実", "アットホーム"],
    },
    en: {
      name: "Minenohara Kogen",
      region: "Joshinetsu Kogen",
      summary: "Cozy resort at 1,500m elevation offering breathtaking North Alps panoramas (renaming back to Minenohara Kogen). Family friendly with great kids park.",
      tags: ["North Alps Panorama", "Kids & Family Park", "High Altitude Snow"],
    },
  },
  yunomaru: {
    zh: {
      name: "汤之丸",
      region: "上信越高原",
      summary: "号称“距离首都圈最近的优质粉雪雪场”。标高达1,700米，拥有优异的干粉雪雪质与极高的冬日晴天率。",
      tags: ["首都圈最速粉雪", "标高1700m", "高晴天率"],
    },
    ja: {
      name: "湯の丸",
      region: "上信越高原",
      summary: "「首都圏から一番近いパウダースノー」と称される標高1,700mの高原ゲレンデ。高い晴天率と高品質なドライパウダーが魅力。",
      tags: ["首都圏最寄パウダー", "標高1700m", "高晴天率"],
    },
    en: {
      name: "Yunomaru",
      region: "Joshinetsu Kogen",
      summary: "Known as the closest powder snow resort to the Tokyo metro area, sitting at 1,700m elevation with high sunny rates and crisp dry powder.",
      tags: ["Closest Tokyo Powder", "1700m Elevation", "High Sunny Days"],
    },
  },
  "saku-parada": {
    zh: {
      name: "佐久PARADA",
      region: "上信越高原",
      summary: "全日本唯一由高速公路服务区（佐久平PA）通过自动扶梯直连的滑雪场，无需离开高速即可直接滑雪，亲子友好。",
      tags: ["高速服务区直连", "零下道交通", "亲子初学天堂"],
    },
    ja: {
      name: "佐久パラダ",
      region: "上信越高原",
      summary: "日本唯一、高速道路のPA（佐久平PA）からエスカレーターで直結するハイウェイゲレンデ。下道ドライブ不要でファミリーに最適。",
      tags: ["PA直結ゲレンデ", "高速から直結", "ファミリー天国"],
    },
    en: {
      name: "Saku Parada",
      region: "Joshinetsu Kogen",
      summary: "Japan's only expressway PA-connected ski resort, accessible via escalator directly from Sakudaira PA without driving on local roads.",
      tags: ["Expressway PA direct", "Zero local road driving", "Family Heaven"],
    },
  },
  "karuizawa-snow-park": {
    zh: {
      name: "轻井泽雪地公园",
      region: "上信越高原",
      summary: "位于北轻井泽的主题亲子滑雪公园。包含日本最大级的儿童雪上玩乐区、平缓安全初学坡道以及爱犬专属嬉雪区。",
      tags: ["北轻井泽亲子", "儿童玩雪天堂", "宠物友好"],
    },
    ja: {
      name: "軽井沢スノーパーク",
      region: "上信越高原",
      summary: "北軽井沢に位置するファミリー＆キッズ特化型リゾート。ちびっこ広場や雪遊びエリアが充実し、愛犬と同伴できるゾーンも人気。",
      tags: ["キッズ特化", "雪遊びテーマパーク", "愛犬同伴OK"],
    },
    en: {
      name: "Karuizawa Snow Park",
      region: "Joshinetsu Kogen",
      summary: "A dedicated family and kids snow park in North Karuizawa featuring large scale snow play areas, gentle beginner slopes, and dog parks.",
      tags: ["North Karuizawa Family", "Kids Snow Park", "Pet Friendly"],
    },
  },
  "takamine-mountain-park": {
    zh: {
      name: "高峰山地公园",
      region: "上信越高原",
      summary: "原Asama 2000 Park。海拔底座1,880米、山顶2,050米，本州最高标高雪场之一，以精细平整的硬质刻滑打理雪道著称。",
      tags: ["标高2000m", "刻滑压雪圣地", "旧Asama2000"],
    },
    ja: {
      name: "高峰マウンテンパーク",
      region: "上信越高原",
      summary: "旧アサマ2000パーク。ボトム標高1,880m、トップ2,050mを誇る本州屈指の標高。引き締まった最高品質の硬質圧雪バーンが魅力。",
      tags: ["標高2000m超", "カービングの聖地", "旧アサマ2000"],
    },
    en: {
      name: "Takamine Mountain Park",
      region: "Joshinetsu Kogen",
      summary: "Formerly Asama 2000 Park. Base elevation of 1,880m and peak at 2,050m. Famous among carving enthusiasts for hard-pack groomed racing quality snow.",
      tags: ["2000m High Altitude", "Carving Heaven", "Former Asama 2000"],
    },
  },
  "yamaboku-wild-snow-park": {
    zh: {
      name: "YAMABOKU野生雪地公园",
      region: "上信越高原",
      summary: "全场70%以上区域为未经压雪的天然野雪区，并提供CAT压雪车野雪滑走体验，是追求天然粉雪与野雪爱好者的天堂。",
      tags: ["70%非压雪野雪", "CAT野雪压雪车", "笠岳绝景粉雪"],
    },
    ja: {
      name: "YAMABOKUワイルドスノーパーク",
      region: "上信越高原",
      summary: "ゲレンデの70%以上が「非圧雪ナチュラルパウダーゾーン」。CAT（圧雪車）によるバックカントリーツアーも開催されるパウダー天国。",
      tags: ["70%非圧雪ゾーン", "CATツアー開催", "自然派パウダー"],
    },
    en: {
      name: "YAMABOKU Wild Snow Park",
      region: "Joshinetsu Kogen",
      summary: "Over 70% of the resort is non-groomed natural powder terrain. Offers snowcat (CAT) skiing tours, making it a true wild powder sanctuary.",
      tags: ["70% Ungroomed Terrain", "Snowcat Tours", "Wild Powder Sanctuary"],
    },
  },
  "hijiri-kogen": {
    zh: {
      name: "圣高原",
      region: "上信越高原",
      summary: "位于圣山山麓的村营温馨雪场，远离拥挤喧嚣。雪票价格极亲民，拥有安全平缓的家庭与儿童练习坡道。",
      tags: ["温馨秘境雪场", "亲民超低票价", "人少避开拥挤"],
    },
    ja: {
      name: "聖高原",
      region: "上信越高原",
      summary: "聖山の麓に広がる村営のアットホームゲレンデ。混雑とは無縁のリラックス空間で、格安の料金と安全なファミリーコースが人気。",
      tags: ["ローカル隠れ家", "リーズナブル", "混雑ゼロ"],
    },
    en: {
      name: "Hijiri Kogen",
      region: "Joshinetsu Kogen",
      summary: "A relaxed village-run ski resort at the base of Mt. Hijiri. Free from crowds, offering budget-friendly lift tickets and safe slopes for practice.",
      tags: ["Cozy Secret Spot", "Budget Friendly", "Uncrowded Slopes"],
    },
  },
  "nozawa-onsen": {
    zh: {
      name: "野泽温泉",
      region: "志贺・野泽",
      summary: "日本历史悠久的顶级雪场温泉度假村。拥有毛无山顶超广阔优质粉雪、10公里超长雪道与古色古香的温泉街（外汤巡游），滑雪与温泉文化完美融合。",
      tags: ["10km超长雪道", "外汤巡游", "古朴温泉街"],
    },
    ja: {
      name: "野沢温泉",
      region: "志賀・野沢",
      summary: "日本を代表するビッグゲレンデ＆温泉街リゾート。毛無山頂からの極上パウダーと最長10kmのロングコース、13の外湯巡りが大人気。",
      tags: ["最長10km", "外湯巡り", "天然パウダー"],
    },
    en: {
      name: "Nozawa Onsen",
      region: "Shiga & Nozawa",
      summary: "Iconic Japanese ski village combining Mt. Kenashi's deep powder, a 10km long run, 2 gondolas, and historic free public hot springs (Sotoyu).",
      tags: ["10km Long Run", "Hot Spring Village", "Deep Powder"],
    },
  },
  "togari-onsen": {
    zh: {
      name: "户狩温泉",
      region: "志贺・野泽",
      summary: "与野泽温泉隔千曲川相望，拥有一流的天然粉雪与独特雪上自行车（Snow Bike）公园，山麓天然温泉极具性价比且氛围温馨。",
      tags: ["雪上自行车", "天然温泉", "高性价比"],
    },
    ja: {
      name: "戸狩温泉",
      region: "志賀・野沢",
      summary: "野沢温泉の対岸に位置するアットホームな雪場。天然パウダーと日本初の雪上自転車（スノーバイク）パークが話題。温泉と絶品信州米も魅力。",
      tags: ["スノーバイク", "温泉直結", "アットホーム"],
    },
    en: {
      name: "Togari Onsen",
      region: "Shiga & Nozawa",
      summary: "Located across the Chikuma River from Nozawa Onsen. Offers great natural powder, Japan's pioneer snow bike park, and cozy hot spring baths.",
      tags: ["Snow Bike Park", "Onsen Village", "Cozy Atmosphere"],
    },
  },
  "romance-no-kamisama": {
    zh: {
      name: "恋爱之神（原木岛平）",
      region: "志贺・野泽",
      summary: "原木岛平滑雪场，因广濑香美名曲命名。拥有最大斜度46°的全日本最陡压雪/未压雪黑道“Pioneer Course”与广阔超缓初级道。",
      tags: ["46°日本最陡斜面", "原木岛平", "超级宽广初级道"],
    },
    ja: {
      name: "ロマンスの神様",
      region: "志賀・野沢",
      summary: "旧木島平スキー場。広瀬香美の名曲から改名。最大斜度46°の日本一の急斜面「パイオニアコース」と、広大な初心者バーンが共存。",
      tags: ["最大斜度46度", "旧木島平", "超ワイド初心者斜面"],
    },
    en: {
      name: "Romance no Kamisama",
      region: "Shiga & Nozawa",
      summary: "Formerly Kijimadaira, named after Kohmi Hirose's hit song. Home to Japan's steepest 46-degree slope (Pioneer Course) and wide beginner runs.",
      tags: ["Steepest 46° In Japan", "Former Kijimadaira", "Wide Beginner Slopes"],
    },
  },
  "sakae-club": {
    zh: {
      name: "荣俱乐部",
      region: "志贺・野泽",
      summary: "位于长野县秘境荣村的极豪雪区域雪场。以极其惊人的天然降雪量和纯朴的农家风味野味美食著称，是资深粉雪玩家的私藏宝地。",
      tags: ["秘境豪雪", "天然超大雪量", "乡土美食"],
    },
    ja: {
      name: "さかえ倶楽部",
      region: "志賀・野沢",
      summary: "長野県最北端の豪雪地帯・栄村に位置する秘境ゲレンデ。圧巻の天然降雪量と地元の美味しい郷土料理が愛される穴場。",
      tags: ["秘境豪雪", "圧倒的降雪量", "郷土料理"],
    },
    en: {
      name: "Sakae Club",
      region: "Shiga & Nozawa",
      summary: "Tucked away in Sakae Village, one of Japan's snowiest areas. Famous for massive natural snowfall, uncrowded slopes, and authentic local food.",
      tags: ["Deep Snow Secret", "Heavy Snowfall", "Local Cuisine"],
    },
  },
  "shiga-kogen": {
    zh: {
      name: "志贺高原",
      region: "志贺・野泽",
      summary: "全日本规模最大、海拔最高（最高山顶横手山 2,307m）的联合滑雪大区。由18座雪场联通组成，雪质绝佳，曾为长野冬奥会赛场。",
      tags: ["日本最大联合雪场", "日本标高最高2307m", "18区通滑"],
    },
    ja: {
      name: "志賀高原",
      region: "志賀・野沢",
      summary: "日本最大規模かつ日本最高標高（横手山2,307m）を誇るスノーリゾート。全18エリアが共通リフト券で連結し、極上の天然粉雪とスケールが圧倒的。",
      tags: ["日本最大スケール", "日本最高標高2307m", "18エリア共通"],
    },
    en: {
      name: "Shiga Kogen",
      region: "Shiga & Nozawa",
      summary: "Japan's largest ski area with 18 interconnected resorts under one pass. Features Japan's highest resort summit (Mt. Yokote at 2,307m) and Olympic courses.",
      tags: ["Japan's Largest Area", "Highest Elevation 2307m", "18 Resorts Unified"],
    },
  },
  "ryuo-ski-park": {
    zh: {
      name: "龙王公园",
      region: "志贺・野泽",
      summary: "拥有搭载166人的大型空中索道与著名的“SORA terrace”云海咖啡露台。山顶木落雪道（Kiotoshi Course）以极深粉雪陡坡闻名。",
      tags: ["SORA云海露台", "166人空中索道", "木落深粉陡坡"],
    },
    ja: {
      name: "竜王",
      region: "志賀・野沢",
      summary: "166人乗り世界最大級ロープウェイで登る「SORA terrace」の雲海絶景がSNSで大人気。山頂のパウダー急斜面「木落しコース」はフリーライダーの憧れ。",
      tags: ["SORA terrace雲海", "世界最大級ロープウェイ", "木落しパウダー"],
    },
    en: {
      name: "Ryuo Ski Park",
      region: "Shiga & Nozawa",
      summary: "Famous for the SORA terrace cloud-sea lounge accessed by a 166-passenger ropeway. Home to the steep 'Kiotoshi' powder course.",
      tags: ["SORA Cloud Terrace", "166-pax Ropeway", "Kiotoshi Powder Wall"],
    },
  },
  "x-jam-takaifuji-yomase": {
    zh: {
      name: "X-JAM高井富士＆夜间温泉",
      region: "志贺・野泽",
      summary: "由高井富士公园区与夜间温泉打理道区完全通滑组成的综合滑雪场。拥有关东/信州最大级别的单板Freestyle公园（跳台、Jib与半管道），结合大广角刻滑压雪道与山麓露天温泉“远见之汤”。",
      tags: ["日本顶级单板公园", "竞技刻滑打理道", "远见之汤温泉"],
    },
    ja: {
      name: "X-JAM高井富士＆よませ温泉",
      region: "志賀・野沢",
      summary: "日本最大級のフリースタイルパークを誇るX-JAM高井富士と、絶景圧雪＆アルペンポールのよませ温泉が完全連結したビッグゲレンデ。山麓の露天風呂「遠見の湯」も大人気。",
      tags: ["日本最大級パーク", "絶景カービング", "遠見の湯温泉"],
    },
    en: {
      name: "X-JAM Takaifuji & Yomase Onsen",
      region: "Shiga & Nozawa",
      summary: "Fully interconnected ski resort combining X-JAM Takaifuji's premier terrain park (kickers, jibs, halfpipe) with Yomase Onsen's wide carving slopes and famous Tomi-no-yu outdoor hot spring.",
      tags: ["Premier Terrain Park", "Wide Carving Slopes", "Tomi-no-yu Onsen"],
    },
  },
  "komaruyama": {
    zh: {
      name: "北志贺小丸山",
      region: "志贺・野泽",
      summary: "位于北志贺区域的温馨小众雪场，坡度平缓安全、视野开阔，极佳适合学生团体、练习初级姿势与亲子家庭出行。",
      tags: ["平缓适合新手", "学生团热选", "高性价比"],
    },
    ja: {
      name: "北志賀小丸山",
      region: "志賀・野沢",
      summary: "北志賀エリアに位置するアットホームゲレンデ。視界の開けた緩斜面が多く、ビギナーの練習や学生ツアー、ファミリーに親しまれている。",
      tags: ["初心者向け", "アットホーム", "コスパ抜群"],
    },
    en: {
      name: "Kitashiga Komaruyama",
      region: "Shiga & Nozawa",
      summary: "Friendly, compact ski resort in Kitashiga with gentle, open slopes ideal for beginners, student groups, and families practicing basic technique.",
      tags: ["Beginner Friendly", "Compact & Friendly", "Great Value"],
    },
  },
};

export function getResortContent(slug: string, locale: Locale): ResortContent {
  return resortContent[slug][locale];
}
