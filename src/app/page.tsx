import { getArticles } from "@/lib/articles";
import { AppShell } from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function Home() {
  const articles = await getArticles();
  return <AppShell articles={articles} />;
}
