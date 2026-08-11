import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('src/lib/resorts.ts', 'utf8');

// Travel updates from Tokyo Station (東京駅) as departure point
const resortUpdates = [
  // Echigo-Yuzawa Region
  { slug: 'gala-yuzawa', carMin: 150, carKm: 196, etcYen: 4410 },
  { slug: 'naeba', carMin: 170, carKm: 202, etcYen: 4410 },
  { slug: 'kagura', carMin: 167, carKm: 195, etcYen: 4410 },
  { slug: 'kandatsu', carMin: 145, carKm: 193, etcYen: 4410 },
  { slug: 'iwappara', carMin: 145, carKm: 194, etcYen: 4410 },
  { slug: 'yuzawa-park', carMin: 145, carKm: 193, etcYen: 4410 },
  { slug: 'yuzawa-nakazato', carMin: 142, carKm: 192, etcYen: 4410 },
  { slug: 'yuzawa-kogen', carMin: 148, carKm: 195, etcYen: 4410 },
  { slug: 'naspa-ski-garden', carMin: 145, carKm: 195, etcYen: 4410 },
  { slug: 'ishiuchi-maruyama', carMin: 150, carKm: 198, etcYen: 4560 },
  { slug: 'maiko', carMin: 145, carKm: 200, etcYen: 4560 },
  { slug: 'joetsu-kokusai', carMin: 155, carKm: 204, etcYen: 4560 },
  { slug: 'hakkaisan', carMin: 170, carKm: 220, etcYen: 4760 },
  { slug: 'hakkaisan-sanroku', carMin: 165, carKm: 216, etcYen: 4760 },
  { slug: 'muika', carMin: 155, carKm: 210, etcYen: 4760 },
  { slug: 'chateau-shiozawa', carMin: 152, carKm: 202, etcYen: 4560 },
  { slug: 'nakazato-snow-wood', carMin: 142, carKm: 192, etcYen: 4410 },
  { slug: 'suhara', carMin: 180, carKm: 225, etcYen: 5100 },
  { slug: 'yakushi', carMin: 170, carKm: 220, etcYen: 5100 },
  { slug: 'koide', carMin: 168, carKm: 218, etcYen: 5100 },
  { slug: 'okutadami-maruyama', carMin: 225, carKm: 250, etcYen: 5100 },
  { slug: 'new-green-pia-tsunan', carMin: 180, carKm: 225, etcYen: 4560 },

  // Gunma-Tochigi Region
  { slug: 'kawaba', carMin: 135, carKm: 165, etcYen: 3710 },
  { slug: 'oze-iwakura', carMin: 150, carKm: 180, etcYen: 3710 },
  { slug: 'marunuma-kogen', carMin: 165, carKm: 195, etcYen: 3710 },
  { slug: 'minakami-hodaigi', carMin: 150, carKm: 165, etcYen: 3920 },
  { slug: 'ogna-hotaka', carMin: 145, carKm: 175, etcYen: 3710 },
  { slug: 'hunter-mountain-shiobara', carMin: 155, carKm: 180, etcYen: 3940 },
  { slug: 'katashina-kogen', carMin: 148, carKm: 178, etcYen: 3710 },
  { slug: 'edelweiss-ski-resort', carMin: 150, carKm: 178, etcYen: 3940 },
  { slug: 'snow-park-oze-tokura', carMin: 155, carKm: 183, etcYen: 3710 },
  { slug: 'tambara-ski-park', carMin: 145, carKm: 160, etcYen: 3710 },
  { slug: 'okutone-snow-park', carMin: 130, carKm: 155, etcYen: 3920 },
  { slug: 'norn-minakami', carMin: 125, carKm: 150, etcYen: 3920 },
  { slug: 'minakami-kogen-resort', carMin: 155, carKm: 170, etcYen: 3920 },
  { slug: 'minakami-fujiwara', carMin: 155, carKm: 170, etcYen: 3920 },
  { slug: 'white-valley-minakami', carMin: 135, carKm: 155, etcYen: 3920 },
  { slug: 'nikko-yumoto-onsen', carMin: 165, carKm: 170, etcYen: 4190 },
  { slug: 'mt-t-hoshino', carMin: 145, carKm: 165, etcYen: 3920 },

  // Joshinetsu Region
  { slug: 'karuizawa-prince', carMin: 125, carKm: 160, etcYen: 3800 },
  { slug: 'sugadaira-kogen', carMin: 170, carKm: 200, etcYen: 4540 },
  { slug: 'palcall-tsumagoi', carMin: 175, carKm: 195, etcYen: 3800 },
  { slug: 'manza-onsen', carMin: 190, carKm: 205, etcYen: 3800 },
  { slug: 'kusatsu-onsen', carMin: 165, carKm: 190, etcYen: 2900 },
  { slug: 'kazawa-snow-area', carMin: 160, carKm: 185, etcYen: 3800 },
  { slug: 'minenohara-kogen', carMin: 172, carKm: 202, etcYen: 4540 },
  { slug: 'yunomaru', carMin: 155, carKm: 182, etcYen: 4150 },
  { slug: 'saku-parada', carMin: 125, carKm: 162, etcYen: 4060 },
  { slug: 'karuizawa-snow-park', carMin: 150, carKm: 175, etcYen: 3800 },
  { slug: 'takamine-mountain-park', carMin: 160, carKm: 185, etcYen: 4150 },
  { slug: 'yamaboku-wild-snow-park', carMin: 210, carKm: 255, etcYen: 5410 },
  { slug: 'hijiri-kogen', carMin: 160, carKm: 210, etcYen: 4700 },

  // Shiga-Nozawa Region
  { slug: 'nozawa-onsen', carMin: 200, carKm: 255, etcYen: 5620 },
  { slug: 'togari-onsen', carMin: 205, carKm: 260, etcYen: 5620 },
  { slug: 'romance-no-kamisama', carMin: 195, carKm: 250, etcYen: 5620 },
  { slug: 'sakae-club', carMin: 220, carKm: 280, etcYen: 5620 },
  { slug: 'shiga-kogen', carMin: 200, carKm: 250, etcYen: 5410 },
  { slug: 'ryuo-ski-park', carMin: 190, carKm: 245, etcYen: 5410 },
  { slug: 'x-jam-takaifuji-yomase', carMin: 185, carKm: 245, etcYen: 5410 },
  { slug: 'komaruyama', carMin: 185, carKm: 242, etcYen: 5410 },

  // Hakuba Region
  { slug: 'kashimayari', carMin: 210, carKm: 260, etcYen: 4740 },
  { slug: 'jiigatake', carMin: 205, carKm: 255, etcYen: 4740 },
  { slug: 'tsugaike-kogen', carMin: 235, carKm: 283, etcYen: 4740 },
  { slug: 'hakuba-iwatake', carMin: 230, carKm: 278, etcYen: 4740 },
  { slug: 'hakuba-goryu-47', carMin: 220, carKm: 270, etcYen: 4740 },
  { slug: 'hakuba-cortina', carMin: 245, carKm: 290, etcYen: 4740 },
  { slug: 'hakuba-sanosaka', carMin: 215, carKm: 265, etcYen: 4740 },
  { slug: 'hakuba-happo-one', carMin: 225, carKm: 275, etcYen: 4740 },
];

let updatedContent = content;
let updateCount = 0;

for (const update of resortUpdates) {
  const slugPattern = new RegExp(
    '(slug:\\s*"' + update.slug + '"[\\s\\S]*?travel:\\s*\\{[^}]*?carMin:\\s*)\\d+([^}]*?carKm:\\s*)\\d+([^}]*?etcYen:\\s*)\\d+',
    'g'
  );
  const newContent = updatedContent.replace(slugPattern, (match, p1, p2, p3) => {
    updateCount++;
    return p1 + update.carMin + p2 + update.carKm + p3 + update.etcYen;
  });
  if (newContent !== updatedContent) {
    updatedContent = newContent;
  }
}

writeFileSync('src/lib/resorts.ts', updatedContent, 'utf8');
console.log('Updated', updateCount, 'resorts');