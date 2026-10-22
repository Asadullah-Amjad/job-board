import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import LatestJobs from "@/components/home/LatestJobs";
import BenefitsSection from "@/components/home/BenefitsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <LatestJobs />
      <BenefitsSection />
    </>
  );
}
