import { getTranslations } from "next-intl/server";
import { resorts } from "./resorts";
import { Resort, ResortText } from "./types";

export type LocalizedResort = Resort & ResortText;

export async function getLocalizedResorts(): Promise<LocalizedResort[]> {
  const t = await getTranslations("resorts");
  return resorts.map((r) => ({
    ...r,
    name: t(`${r.slug}.name`),
    region: t(`${r.slug}.region`),
    summary: t(`${r.slug}.summary`),
    tags: t.raw(`${r.slug}.tags`) as string[],
  }));
}

export async function getLocalizedResort(slug: string): Promise<LocalizedResort | undefined> {
  const all = await getLocalizedResorts();
  return all.find((r) => r.slug === slug);
}
