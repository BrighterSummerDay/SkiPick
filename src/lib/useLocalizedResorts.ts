"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { resorts } from "./resorts";
import { LocalizedResort } from "./getLocalizedResorts";

export function useLocalizedResorts(): LocalizedResort[] {
  const t = useTranslations("resorts");
  return useMemo(
    () =>
      resorts.map((r) => ({
        ...r,
        name: t(`${r.slug}.name`),
        region: t(`${r.slug}.region`),
        summary: t(`${r.slug}.summary`),
        tags: t.raw(`${r.slug}.tags`) as string[],
      })),
    [t]
  );
}
