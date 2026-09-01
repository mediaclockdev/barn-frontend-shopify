import CoreAbout from "@/src/components/about/CoreAbout";
import HeroAbout from "@/src/components/about/HeroAbout";
import StoryAbout from "@/src/components/about/StoryAbout";
import { getAboutPageData } from "@/src/utils/about-api";
import { ABOUT_FALLBACK } from "@/src/utils/about-fallback";
import { constructMetadata } from "@/src/utils/seo";

export async function generateMetadata() {
  const res = await getAboutPageData();
  const data = { ...ABOUT_FALLBACK, ...(res?.data || {}) };

  return constructMetadata({
    title: `${data.hero_title} | Barn`,
    description: data.hero_subtitle,
    image: data.hero_image,
  });
}

const page = async () => {
  const res = await getAboutPageData();

  // Merge: API data wins, fallback fills any gaps
  const data = { ...ABOUT_FALLBACK, ...(res?.data || {}) };


  return (
    <div>
      <HeroAbout
        title={data.hero_title}
        subtitle={data.hero_subtitle}
        image={data.hero_image}
      />
      <StoryAbout
        title={data.story_title}
        content={data.story_content}
        image={data.story_image}
      />
      <CoreAbout
        values={[data.core_value_1, data.core_value_2, data.core_value_3]}
      />
    </div>
  );
};

export default page;
