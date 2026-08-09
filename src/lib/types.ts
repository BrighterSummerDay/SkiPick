export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Resort {
  slug: string;
  /** 雪场的日文原名，作为固定参考信息，不随界面语言切换 */
  nameJa: string;
  /** 所属的地图大区域 id，对应 regions.ts 里的 REGIONS */
  regionId: string;
  lat: number;
  lng: number;
  /** 雪场轮廓（支持单多边形或 MultiPolygon 数组） */
  areaPolygon: [number, number][] | [number, number][][];
  basePrice: number; // 单日券，日元
  seasonPassPrice: number; // season pass，日元
  courses: {
    total: number;
    beginner: number;
    intermediate: number;
    advanced: number;
    longestKm: number;
  };
  lifts: {
    total: number;
    gondola: number;
  };
  elevation: {
    baseM: number;
    topM: number;
    verticalM: number;
  };
  travel: {
    shinkansenMin: number;
    shinkansenYen: number;
    carMin: number;
    carKm: number;
    etcYen: number;
  };
}

/** 雪场的多语言文本内容，来自 messages/{locale}.json 的 resorts 命名空间 */
export interface ResortText {
  name: string;
  region: string;
  summary: string;
  tags: string[];
}
