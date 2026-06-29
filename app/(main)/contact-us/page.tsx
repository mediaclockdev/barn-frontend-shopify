import HeroContact from "@/src/components/contact/HeroContact";
import ContactSection from "@/src/components/contact/InfoContact";
import { getContactPageData } from "@/src/utils/contact-api";
import { CONTACT_FALLBACK } from "@/src/utils/contact-fallback";
import { constructMetadata } from "@/src/utils/seo";

export async function generateMetadata() {
  const res = await getContactPageData();
  const data = { ...CONTACT_FALLBACK, ...(res?.data || {}) };

  return constructMetadata({
    title: `${data.hero_title} | Barn`,
    description: data.hero_subtitle,
    image: data.hero_image,
  });
}

const page = async () => {
  const res = await getContactPageData();
  const data = { ...CONTACT_FALLBACK, ...(res?.data || {}) };

  return (
    <div>
      <HeroContact
        title={data.hero_title}
        subtitle={data.hero_subtitle}
        image={data.hero_image}
      />
      <ContactSection
        address={data.address}
        addressMapUrl={data.address_map_url}
        phone={data.phone}
        businessHours={data.business_hours}
        email={data.email}
        mapEmbedUrl={data.map_embed_url}
      />
    </div>
  );
};

export default page;
