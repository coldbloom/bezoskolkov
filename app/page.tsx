import { ProtectionPage } from "@/components/ProtectionPage";
import { createPageMetadata, homePageData } from "@/lib/seo";

export const metadata = createPageMetadata(homePageData);

export default function Home() {
  return <ProtectionPage />;
}
