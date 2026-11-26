import { ReferenceHome } from "@/components/reference-home";
import { publicData } from "@/lib/public-data";
export default async function Home() {
  const { portfolio, services, settings } = await publicData();
  return (
    <ReferenceHome portfolio={portfolio} services={services} settings={settings} />
  );
}
