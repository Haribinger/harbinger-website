import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import AutonomousSection from "@/components/AutonomousSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import FeaturesSection from "@/components/FeaturesSection";
import RedTeamC2Section from "@/components/RedTeamC2Section";
import SecuritySection from "@/components/SecuritySection";
import QuickstartSection from "@/components/QuickstartSection";
import ComparisonSection from "@/components/ComparisonSection";
import ChangelogSection from "@/components/ChangelogSection";
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
      <AutonomousSection />
      <ArchitectureSection />
      <FeaturesSection />
      <RedTeamC2Section />
      <SecuritySection />
      <QuickstartSection />
      <ComparisonSection />
      <ChangelogSection />
      <RoadmapSection />
      <TechStackSection />
      <CommunitySection />
      <EcosystemSection />
      <Footer />
    </div>
  );
}
