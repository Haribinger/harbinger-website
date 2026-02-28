import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";

// Below-fold sections are lazy-loaded to reduce initial bundle size
const AutonomousSection = lazy(() => import("@/components/AutonomousSection"));
const ArchitectureSection = lazy(() => import("@/components/ArchitectureSection"));
const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const RedTeamC2Section = lazy(() => import("@/components/RedTeamC2Section"));
const SecuritySection = lazy(() => import("@/components/SecuritySection"));
const QuickstartSection = lazy(() => import("@/components/QuickstartSection"));
const ComparisonSection = lazy(() => import("@/components/ComparisonSection"));
const ChangelogSection = lazy(() => import("@/components/ChangelogSection"));
const RoadmapSection = lazy(() => import("@/components/RoadmapSection"));
const TechStackSection = lazy(() => import("@/components/TechStackSection"));
const CommunitySection = lazy(() => import("@/components/CommunitySection"));
const EcosystemSection = lazy(() => import("@/components/EcosystemSection"));
const Footer = lazy(() => import("@/components/Footer"));

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <Suspense fallback={null}>
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
      </Suspense>
    </div>
  );
}
