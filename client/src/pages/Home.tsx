import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import FeaturesSection from "@/components/FeaturesSection";
import SecuritySection from "@/components/SecuritySection";
import QuickstartSection from "@/components/QuickstartSection";
import ComparisonSection from "@/components/ComparisonSection";
import RoadmapSection from "@/components/RoadmapSection";
import TechStackSection from "@/components/TechStackSection";
import CommunitySection from "@/components/CommunitySection";
import EcosystemSection from "@/components/EcosystemSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ArchitectureSection />
      <FeaturesSection />
      <SecuritySection />
      <QuickstartSection />
      <ComparisonSection />
      <RoadmapSection />
      <TechStackSection />
      <CommunitySection />
      <EcosystemSection />
      <Footer />
    </div>
  );
}
