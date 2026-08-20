import { NewsList } from "@/components/NewsList";
import { getLocalizedNews } from "@/lib/getLocalizedNews";

export default async function NewsPage() {
  const news = await getLocalizedNews();

  return (
    <div className="mx-auto max-w-[1100px] w-full px-4 sm:px-8 mb-8 sm:mb-12">
      <NewsList news={news} />
    </div>
  );
}
