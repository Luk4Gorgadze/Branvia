import CampaignGallery from "@/_components/main/CampaignGallery";
import AboutSection from "@/_components/main/AboutSection";
import HeroSection from "@/_components/main/HeroSection";
import PricingSection from "@/_components/main/PricingSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CampaignGallery />
      <AboutSection />
      <PricingSection />
    </>
  );
}
