/**
 * fetch-osm-data.mjs
 *
 * 从 Overpass API 批量抓取每个雪场的雪道（piste:type）和缆车/lift（aerialway）数据，
 * 并用 Open-Elevation API 补充高程信息（descent, avgSlope），
 * 将结果保存到 public/osm/{slug}.json。
 *
 * 用法：
 *   node scripts/fetch-osm-data.mjs
 *   node scripts/fetch-osm-data.mjs --slug gala-yuzawa   # 只抓某一个雪场
 *   node scripts/fetch-osm-data.mjs --no-elevation        # 跳过高程补充（更快）
 *
 * 输出格式（每个 {slug}.json）：
 * {
 *   "slug": "gala-yuzawa",
 *   "fetchedAt": "2026-08-16T...",
 *   "runs": { GeoJSON FeatureCollection },   // 雪道
 *   "lifts": { GeoJSON FeatureCollection }   // 缆车/lift
 * }
 *
 * 雪道 Feature.properties：
 *   name, nameJa, pisteType, difficulty, grooming, lit
 *   distanceM, descentM, avgSlope (%), maxSlope (%)
 *
 * 缆车 Feature.properties：
 *   name, nameJa, aerialwayType, capacity, occupancy, bubble, heating
 *   distanceM, verticalM, avgSlope (%)
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const ELEVATION_URL = "https://api.open-elevation.com/api/v1/lookup";

const DELAY_MS = 3000;          // 正常请求间隔
const RETRY_DELAYS = [8000, 20000, 45000]; // 重试等待：8s, 20s, 45s
const ELEVATION_DELAY_MS = 1000;

// ── 读取所有 resort 的 slug + areaPolygon bbox ────────────────────────────
function loadResorts() {
  const src = readFileSync(join(ROOT, "src/lib/resorts.ts"), "utf8");
  const results = [];
  const slugRegex = /slug:\s*"([^"]+)"/g;
  const slugs = [];
  let m;
  while ((m = slugRegex.exec(src)) !== null) {
    slugs.push({ slug: m[1], pos: m.index });
  }

  for (let i = 0; i < slugs.length; i++) {
    const start = slugs[i].pos;
    const end = i + 1 < slugs.length ? slugs[i + 1].pos : src.length;
    const block = src.slice(start, end);
    const coordPairs = block.matchAll(/\[(\s*-?[\d.]+\s*),\s*(-?[\d.]+\s*)\]/g);
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    for (const cp of coordPairs) {
      const lng = parseFloat(cp[1]);
      const lat = parseFloat(cp[2]);
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
    if (isFinite(minLng)) {
      results.push({ slug: slugs[i].slug, minLat, minLng, maxLat, maxLng });
    }
  }
  return results;
}

// ── 构建 Overpass QL 查询 ─────────────────────────────────────────────────
function buildQuery(minLat, minLng, maxLat, maxLng) {
  const pad = 0.005;
  const bbox = `${(minLat - pad).toFixed(6)},${(minLng - pad).toFixed(6)},${(maxLat + pad).toFixed(6)},${(maxLng + pad).toFixed(6)}`;
  return `[out:json][timeout:30];
(
  way["piste:type"](${bbox});
  way["aerialway"](${bbox});
  relation["piste:type"](${bbox});
);
out body geom;`;
}

// ── 解析斜率字符串 ────────────────────────────────────────────────────────
function parseSlope(val) {
  if (!val) return null;
  const pctInParens = String(val).match(/\((\d+(?:\.\d+)?)%\)/);
  if (pctInParens) return parseFloat(pctInParens[1]);
  const pct = String(val).match(/(\d+(?:\.\d+)?)%/);
  if (pct) return parseFloat(pct[1]);
  const deg = String(val).match(/(\d+(?:\.\d+)?)°/);
  if (deg) return Math.round(Math.tan((parseFloat(deg[1]) * Math.PI) / 180) * 100);
  return null;
}

// ── Haversine 水平距离 ────────────────────────────────────────────────────
function lineDistance(coords) {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1];
    const [lng2, lat2] = coords[i];
    const R = 6371000;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const dphi = ((lat2 - lat1) * Math.PI) / 180;
    const dlambda = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dphi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
    total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  return Math.round(total);
}

// ── 批量查询高程（Open-Elevation API）────────────────────────────────────
// locations: [{latitude, longitude}, ...]
// 返回对应的高程数组（米），失败时返回 null 数组
async function fetchElevations(locations) {
  try {
    const res = await fetch(ELEVATION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locations }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return locations.map(() => null);
    const data = await res.json();
    return data.results.map((r) => r.elevation ?? null);
  } catch {
    return locations.map(() => null);
  }
}

// ── 将 OSM way nodes 转为 LineString 坐标 ────────────────────────────────
function nodesToCoords(nodes) {
  return nodes.map((n) => [n.lon, n.lat]);
}

// ── 计算沿线各段的斜率（需要高程数组），返回 {avgSlope, maxSlope} ─────────
function calcSlopes(coords, elevations) {
  if (!elevations || elevations.some((e) => e === null)) return { avgSlope: null, maxSlope: null };
  let totalHorizDist = 0;
  let totalVertDrop = 0;
  let maxSlope = 0;
  for (let i = 1; i < coords.length; i++) {
    const horizDist = lineDistance([coords[i - 1], coords[i]]);
    const vertDrop = elevations[i - 1] - elevations[i]; // 正值 = 下降
    if (horizDist > 0) {
      const slopePct = Math.abs((vertDrop / horizDist) * 100);
      if (slopePct > maxSlope) maxSlope = slopePct;
      totalHorizDist += horizDist;
      totalVertDrop += vertDrop;
    }
  }
  const avgSlope = totalHorizDist > 0 ? Math.round(Math.abs((totalVertDrop / totalHorizDist) * 100)) : null;
  return {
    avgSlope,
    maxSlope: maxSlope > 0 ? Math.round(maxSlope) : null,
  };
}

// ── 将 OSM JSON 转为 { runs, lifts } GeoJSON ─────────────────────────────
function osmToGeoJSON(osmData) {
  const runs = { type: "FeatureCollection", features: [] };
  const lifts = { type: "FeatureCollection", features: [] };

  for (const el of osmData.elements ?? []) {
    const tags = el.tags ?? {};
    const isWay = el.type === "way" && el.geometry?.length > 1;
    const isRelation = el.type === "relation";

    if (tags["piste:type"]) {
      let coords = [];
      if (isWay) {
        coords = nodesToCoords(el.geometry);
      } else if (isRelation) {
        const firstWay = el.members?.find((mbr) => mbr.type === "way" && mbr.geometry?.length > 1);
        if (firstWay) coords = nodesToCoords(firstWay.geometry);
      }
      if (coords.length < 2) continue;

      const distanceM = tags["piste:length"] ? parseInt(tags["piste:length"]) : lineDistance(coords);
      const descentM = tags["piste:descent"] ? parseInt(tags["piste:descent"]) : null;
      const avgSlope = parseSlope(tags["piste:avg_slope"] ?? tags["avg_slope"]);
      const maxSlope = parseSlope(tags["piste:max_slope"] ?? tags["max_slope"]);

      runs.features.push({
        type: "Feature",
        id: el.id,
        properties: {
          osmId: el.id,
          name: tags["name:en"] ?? tags["name"] ?? null,
          nameJa: tags["name:ja"] ?? null,
          pisteType: tags["piste:type"],
          difficulty: tags["piste:difficulty"] ?? null,
          grooming: tags["piste:grooming"] ?? null,
          lit: tags["lit"] ?? null,
          distanceM,
          descentM,         // will be filled by elevation pass
          avgSlope,         // will be filled by elevation pass if null
          maxSlope,         // will be filled by elevation pass if null
          // store raw coords for elevation pass
          _coords: coords,
        },
        geometry: { type: "LineString", coordinates: coords },
      });
    } else if (tags["aerialway"]) {
      if (!isWay) continue;
      const coords = nodesToCoords(el.geometry);
      if (coords.length < 2) continue;
      const distanceM = lineDistance(coords);

      lifts.features.push({
        type: "Feature",
        id: el.id,
        properties: {
          osmId: el.id,
          name: tags["name:en"] ?? tags["name"] ?? null,
          nameJa: tags["name:ja"] ?? null,
          aerialwayType: tags["aerialway"],
          capacity: tags["aerialway:capacity"] ? parseInt(tags["aerialway:capacity"]) : null,
          duration: tags["aerialway:duration"] ?? null,
          occupancy: tags["aerialway:occupancy"] ? parseInt(tags["aerialway:occupancy"]) : null,
          bubble: tags["aerialway:bubble"] ?? null,
          heating: tags["aerialway:heating"] ?? null,
          distanceM,
          verticalM: tags["aerialway:vertical"] ? parseInt(tags["aerialway:vertical"]) : null,
          avgSlope: null,
          access: tags["access"] ?? null,
          _coords: coords,
        },
        geometry: { type: "LineString", coordinates: coords },
      });
    }
  }
  return { runs, lifts };
}

// ── 用高程 API 补充 descent / avgSlope / maxSlope / verticalM ────────────
async function enrichWithElevation(runs, lifts) {
  const allFeatures = [
    ...runs.features.map((f) => ({ f, isRun: true })),
    ...lifts.features.map((f) => ({ f, isRun: false })),
  ];

  // 只取起点和终点，减少 API 调用量
  // （对于大量中间点的精细计算，可以改为全量坐标）
  const batchSize = 100; // Open-Elevation 一次最多 ~100 个点
  const allPoints = [];

  for (const { f } of allFeatures) {
    const coords = f.properties._coords;
    if (!coords || coords.length < 2) {
      allPoints.push(null, null);
      continue;
    }
    // 取起点、终点（+ 中间抽样 3 个点，用于更准确的 maxSlope 估算）
    const sample = [
      coords[0],
      coords[Math.floor(coords.length * 0.25)],
      coords[Math.floor(coords.length * 0.5)],
      coords[Math.floor(coords.length * 0.75)],
      coords[coords.length - 1],
    ].filter(Boolean);
    allPoints.push(sample);
  }

  // 打平成一维数组，分批查询
  const flatLocations = [];
  const locationIndex = []; // 每个 feature 的起始 index 和长度
  for (const pts of allPoints) {
    if (!pts) { locationIndex.push(null); continue; }
    locationIndex.push({ start: flatLocations.length, count: pts.length });
    for (const [lng, lat] of pts) {
      flatLocations.push({ latitude: lat, longitude: lng });
    }
  }

  // 分批请求
  const allElevations = new Array(flatLocations.length).fill(null);
  for (let i = 0; i < flatLocations.length; i += batchSize) {
    const batch = flatLocations.slice(i, i + batchSize);
    const elevs = await fetchElevations(batch);
    for (let j = 0; j < elevs.length; j++) {
      allElevations[i + j] = elevs[j];
    }
    if (i + batchSize < flatLocations.length) {
      await new Promise((r) => setTimeout(r, ELEVATION_DELAY_MS));
    }
  }

  // 把高程写回 feature
  for (let i = 0; i < allFeatures.length; i++) {
    const { f, isRun } = allFeatures[i];
    const idx = locationIndex[i];
    if (!idx) continue;

    const elevs = allElevations.slice(idx.start, idx.start + idx.count);
    const coords = f.properties._coords;
    const sampleCoords = [
      coords[0],
      coords[Math.floor(coords.length * 0.25)],
      coords[Math.floor(coords.length * 0.5)],
      coords[Math.floor(coords.length * 0.75)],
      coords[coords.length - 1],
    ].filter(Boolean);

    if (elevs.every((e) => e !== null) && elevs.length >= 2) {
      const topElev = Math.max(...elevs);
      const botElev = Math.min(...elevs);
      const verticalDiff = topElev - botElev; // 高程差

      if (isRun) {
        // 雪道：从上往下，descent = 起点高程 - 终点高程
        const descent = elevs[0] - elevs[elevs.length - 1];
        if (f.properties.descentM === null && descent > 0) {
          f.properties.descentM = Math.round(descent);
        }
        const { avgSlope, maxSlope } = calcSlopes(sampleCoords, elevs);
        if (f.properties.avgSlope === null) f.properties.avgSlope = avgSlope;
        if (f.properties.maxSlope === null) f.properties.maxSlope = maxSlope;
      } else {
        // 缆车：verticalM = 高程差（绝对值）
        if (f.properties.verticalM === null && verticalDiff > 0) {
          f.properties.verticalM = Math.round(verticalDiff);
        }
        // avgSlope for lift
        if (f.properties.avgSlope === null && f.properties.distanceM > 0) {
          f.properties.avgSlope = Math.round(Math.abs((verticalDiff / f.properties.distanceM) * 100));
        }
      }
    }
  }

  // 清除临时字段
  for (const { f } of allFeatures) {
    delete f.properties._coords;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 主逻辑 ────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const slugFilter = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;
  const noElevation = args.includes("--no-elevation");
  const skipExisting = args.includes("--skip-existing");


  const outDir = join(ROOT, "public", "osm");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const resorts = loadResorts();
  const targets = slugFilter ? resorts.filter((r) => r.slug === slugFilter) : resorts;

  if (targets.length === 0) {
    console.error(`No resort found${slugFilter ? ` for slug "${slugFilter}"` : ""}.`);
    process.exit(1);
  }

  console.log(`\n🎿 Fetching OSM data for ${targets.length} resort(s)...\n`);
  if (!noElevation) console.log(`   (elevation enrichment enabled — add --no-elevation to skip)\n`);

  let success = 0, skipped = 0, failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const { slug, minLat, minLng, maxLat, maxLng } = targets[i];
    const outFile = join(outDir, `${slug}.json`);

    // --skip-existing：已有数据文件则跳过
    if (skipExisting && existsSync(outFile)) {
      console.log(`[${i + 1}/${targets.length}] ${slug} ... ⏭  (already exists)`);
      skipped++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${targets.length}] ${slug} ... `);

    let fetchedData = null;
    let lastErr = null;

    // 首次尝试 + 最多 3 次重试
    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      if (attempt > 0) {
        const wait = RETRY_DELAYS[attempt - 1];
        process.stdout.write(`⏳ retry ${attempt} (wait ${wait / 1000}s)... `);
        await sleep(wait);
      }
      try {
        const query = buildQuery(minLat, minLng, maxLat, maxLng);
        const res = await fetch(OVERPASS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "SkiPick/1.0 (ski resort comparison app)",
            "Accept": "application/json",
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: AbortSignal.timeout(40000),
        });

        if (res.status === 429 || res.status === 504 || res.status === 503) {
          lastErr = `HTTP ${res.status}`;
          continue; // 触发重试
        }
        if (!res.ok) {
          lastErr = `HTTP ${res.status}`;
          break; // 其他错误不重试
        }

        fetchedData = await res.json();
        break; // 成功
      } catch (err) {
        lastErr = err.message;
        // timeout 等网络错误也重试
      }
    }

    if (!fetchedData) {
      console.log(`❌ ${lastErr}`);
      failed++;
      await sleep(DELAY_MS);
      continue;
    }

    const { runs, lifts } = osmToGeoJSON(fetchedData);

    if (runs.features.length === 0 && lifts.features.length === 0) {
      console.log(`⚠️  No piste/aerialway data`);
      // 写空文件防止重复查询
      writeFileSync(outFile, JSON.stringify({ slug, fetchedAt: new Date().toISOString(), runs, lifts }, null, 2), "utf8");
      skipped++;
      await sleep(DELAY_MS);
      continue;
    }

    process.stdout.write(`runs=${runs.features.length} lifts=${lifts.features.length}`);

    // 高程补充
    if (!noElevation && (runs.features.length + lifts.features.length) > 0) {
      process.stdout.write(` [elevation...]`);
      await enrichWithElevation(runs, lifts);
    } else {
      for (const f of [...runs.features, ...lifts.features]) {
        delete f.properties._coords;
      }
    }

    writeFileSync(outFile, JSON.stringify({ slug, fetchedAt: new Date().toISOString(), runs, lifts }, null, 2), "utf8");
    console.log(` ✅`);
    success++;

    if (i < targets.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\n─────────────────────────────────────────────`);
  console.log(`Done. ✅ ${success}  ⚠️ ${skipped} skipped  ❌ ${failed} failed`);
  console.log(`Output: ${outDir}\n`);
}

main();
