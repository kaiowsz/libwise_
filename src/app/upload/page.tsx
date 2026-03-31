import { getCategories } from "@/actions/book";
import UploadPageClient from "@/components/UploadForm";

export default async function UploadPage() {
  const categories = await getCategories();

  return <UploadPageClient categories={categories} />;
}
