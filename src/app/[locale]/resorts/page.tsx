import { getTranslations } from "next-intl/server";
import { ResortList } from "@/components/ResortList";
import { getLocalizedResorts } from "@/lib/getLocalizedResorts";

export default async function ResortsPage() {
  const [t, resorts] = await Promise.all([
    getTranslations("resortsPage"),
    getLocalizedResorts(),
  ]);

  return (
    <div
      id="resorts-page-container"
      className="mx-4 sm:mx-8 h-[calc(100vh-var(--header-offset)-44px)] pt-4 flex flex-col overflow-hidden"
    >
      <ResortList resorts={resorts} />
    </div>
  );
}
