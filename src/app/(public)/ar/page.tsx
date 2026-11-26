import { ReferenceHome } from "@/components/reference-home";
import { publicData } from "@/lib/public-data-ar";
export default async function Home() {
  const { portfolio, services, settings } = await publicData();
  return (
    <ReferenceHome
      ar
      portfolio={portfolio}
      services={services}
      settings={settings}
    />
  );
}
