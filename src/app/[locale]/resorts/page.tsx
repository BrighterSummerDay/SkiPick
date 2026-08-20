import { ResortList } from "@/components/ResortList";
import { getLocalizedResorts } from "@/lib/getLocalizedResorts";

export default async function ResortsPage() {
  const resorts = await getLocalizedResorts();

  return (
    <div
      id="resorts-page-container"
      className="mx-4 sm:mx-8 h-[calc(100vh-var(--header-offset)-44px)] pb-1 flex flex-col overflow-hidden"
    >
      <ResortList resorts={resorts} />
    </div>
  );
}
