import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('src/lib/resorts.ts', 'utf8');

// Build regex replacements for each resort's travel line
// Find travel lines by context (slug + travel pattern)
const resortUpdates = [
  // echigo-yuzawa region
  { slug: 'gala-yuzawa', carMin: 115, carKm: 185, etcYen: 4420 },
  { slug: 'naeba', carMin: 135, carKm: 200, etcYen: 4420 },
  { slug: 'kagura', carMin: 125, carKm: 188, etcYen: 4420 },
  { slug: 'kandatsu', carMin: 115, carKm: 182, etcYen: 4420 },
  { slug: 'iwappara', carMin: 115, carKm: 183, etcYen: 4420 },
  { slug: 'muika', carMin: 120, carKm: 185, etcYen: 4420 },
  { slug: 'joetsu-kokusai', carMin: 125, carKm: 188, etcYen: 4420 },
  { slug: 'naspa', carMin: 113, carKm: 182, etcYen: 4420 },
  { slug: 'yuzawa-kogen', carMin: 115, carKm: 183, etcYen: 4420 },
  { slug: 'ishiuchi-maruyama', carMin: 115, carKm: 183, etcYen: 4420 },
  { slug: 'muikamachi-hakkaisan', carMin: 130, carKm: 190, etcYen: 4990 },
  { slug: 'okutadami', carMin: 230, carKm: 255, etcYen: 5170 },
  { slug: 'grandeco', carMin: 250, carKm: 290, etcYen: 7800 },
  // gunma-tochigi region - Nerima -> Numadate IC (¥3600, ~80min)
  { slug: 'kawaba', carMin: 110, carKm: 143, etcYen: 3600 },
  { slug: 'oze-iwakura', carMin: 120, carKm: 163, etcYen: 3600 },
  { slug: 'marunuma-kogen', carMin: 120, carKm: 148, etcYen: 3600 },
  { slug: 'tambara', carMin: 115, carKm: 145, etcYen: 3600 },
  { slug: 'katashina-kogen', carMin: 120, carKm: 148, etcYen: 3600 },
  { slug: 'snow-park-ozonejikura', carMin: 120, carKm: 163, etcYen: 3600 },
  { slug: 'edelweiss', carMin: 115, carKm: 143, etcYen: 3600 },
  // Nerima -> Minakami IC (¥3900, ~90min)
  { slug: 'minakami-kogen', carMin: 115, carKm: 148, etcYen: 3900 },
  { slug: 'minakami-kogen-fujiwara', carMin: 110, carKm: 143, etcYen: 3900 },
  { slug: 'okutone-snow-park', carMin: 125, carKm: 150, etcYen: 3900 },
  { slug: 'norn-minakami', carMin: 100, carKm: 132, etcYen: 3900 },
  { slug: 'hodaigi', carMin: 110, carKm: 140, etcYen: 3900 },
  { slug: 'white-valley-minakami', carMin: 110, carKm: 138, etcYen: 3900 },
  { slug: 'mt-t-hoshino', carMin: 115, carKm: 142, etcYen: 3900 },
  // Tochigi - Nerima -> Nishi-Nasuno Shiobara IC via Tohoku Expressway
  { slug: 'hunter-mountain', carMin: 150, carKm: 185, etcYen: 5200 },
  { slug: 'nikko-yumoto', carMin: 175, carKm: 168, etcYen: 4800 },
  { slug: 'snow-park', carMin: 140, carKm: 162, etcYen: 4200 },
  { slug: 'snowair', carMin: 135, carKm: 158, etcYen: 4000 },
  // joshinetsu region - Karuizawa-Shinshu-Nakano
  { slug: 'karuizawa-prince', carMin: 120, carKm: 148, etcYen: 4010 },
  { slug: 'shiga-kogen', carMin: 210, carKm: 230, etcYen: 5900 },
  { slug: 'nozawa-onsen', carMin: 200, carKm: 240, etcYen: 4320 },
  { slug: 'madarao', carMin: 205, carKm: 240, etcYen: 4320 },
  { slug: 'ikenotaira', carMin: 205, carKm: 242, etcYen: 4320 },
  { slug: 'tangram', carMin: 205, carKm: 242, etcYen: 4320 },
  { slug: 'togari-nozawa-onsen', carMin: 200, carKm: 238, etcYen: 4320 },
  { slug: 'yamaboku', carMin: 220, carKm: 255, etcYen: 5900 },
  { slug: 'x-jam', carMin: 150, carKm: 165, etcYen: 4010 },
  { slug: 'abakuma', carMin: 180, carKm: 205, etcYen: 5200 },
  // hakuba region - Nerima -> Azumino IC (¥4410, ~170min) + 90min to Hakuba
  { slug: 'hakuba-goryu', carMin: 260, carKm: 285, etcYen: 4410 },
  { slug: 'happo-one', carMin: 260, carKm: 285, etcYen: 4410 },
  { slug: 'cortina', carMin: 270, carKm: 290, etcYen: 4410 },
  { slug: 'hakuba-47', carMin: 260, carKm: 285, etcYen: 4410 },
  { slug: 'hakuba-iwatake', carMin: 260, carKm: 285, etcYen: 4410 },
  { slug: 'tsugaike', carMin: 265, carKm: 287, etcYen: 4410 },
  // myoko region - Nerima -> Myoko-kogen IC (¥6040, ~175min)
  { slug: 'myoko-suginohara', carMin: 175, carKm: 252, etcYen: 6040 },
  { slug: 'akakura-onsen', carMin: 180, carKm: 253, etcYen: 6040 },
  { slug: 'akakura-kanko', carMin: 180, carKm: 253, etcYen: 6040 },
  { slug: 'ikenotaira-myoko', carMin: 175, carKm: 250, etcYen: 6040 },
  { slug: 'seki-onsen', carMin: 165, carKm: 248, etcYen: 6040 },
  // yamagata region - much farther
  { slug: 'zao-onsen', carMin: 270, carKm: 358, etcYen: 7900 },
  { slug: 'zao-central', carMin: 270, carKm: 358, etcYen: 7900 },
  { slug: 'aizumi-azuma', carMin: 210, carKm: 260, etcYen: 6200 },
  { slug: 'oguna-hotaka', carMin: 110, carKm: 143, etcYen: 3600 },
  { slug: 'snow-resort-masutsuno', carMin: 170, carKm: 198, etcYen: 4800 },
  { slug: 'yutenji-onsen', carMin: 155, carKm: 170, etcYen: 4500 },
  { slug: 'snow-resort-masutsuno-jizodaira', carMin: 165, carKm: 178, etcYen: 4800 },
];

// For each update, find the resort block and update the travel line
let updatedContent = content;
let updateCount = 0;

for (const update of resortUpdates) {
  const slugPattern = new RegExp(
    '(slug:\\s*"' + update.slug + '"[\\s\\S]*?travel:\\s*\\{[^}]*carMin:\\s*)\\d+([^}]*carKm:\\s*)\\d+([^}]*etcYen:\\s*)\\d+',
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